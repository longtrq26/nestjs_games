import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import ms from 'ms';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { username, password } = registerDto;

    // Kiểm tra existing username
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Tạo user mới trong database
    await this.prisma.user.create({
      data: {
        username: username.toLowerCase().trim(),
        password: hashedPassword,
      },
    });

    return { message: 'User registered successfully' };
  }

  async login(loginDto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; username: string };
  }> {
    const { username, password } = loginDto;

    // Tìm user
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Kiểm tra password
    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Tạo payload
    const payload = { sub: user.id, username: user.username };

    // Tạo access token
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessTokenSecret'),
      expiresIn: this.configService.get<string>(
        'jwt.accessTokenExpirationTime',
      ),
    });

    // Tạo refresh token
    const refreshToken = randomBytes(64).toString('hex');

    const hashedToken = createHash('sha256').update(refreshToken).digest('hex');

    const refreshTokenExpirationTime =
      this.configService.get<string>('jwt.refreshTokenExpirationTime') ?? '7d';

    const expiresAt = new Date(
      Date.now() + ms(refreshTokenExpirationTime as any),
    );

    // Lưu hashed token vào DB
    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username },
    };
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; username: string };
  }> {
    try {
      // Hash refresh token nhận từ client
      const hashed = createHash('sha256').update(refreshToken).digest('hex');

      // Kiểm tra token trong database
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: hashed },
        include: { user: true },
      });

      if (
        !storedToken ||
        !storedToken.user ||
        storedToken.expiresAt < new Date()
      ) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = storedToken.user;

      // Tạo access token mới
      const newPayload = {
        sub: user.id,
        username: user.username,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>('jwt.accessTokenSecret'),
        expiresIn: this.configService.get<string>(
          'jwt.accessTokenExpirationTime',
        ),
      });

      // Tạo refresh token mới
      const newRefreshToken = randomBytes(64).toString('hex');

      const hashedNewToken = createHash('sha256')
        .update(newRefreshToken)
        .digest('hex');

      const refreshTokenExpirationTime =
        this.configService.get<string>('jwt.refreshTokenExpirationTime') ??
        '7d';

      const expiresAt = new Date(
        Date.now() + ms(refreshTokenExpirationTime as any),
      );

      // Xóa token cũ + tạo token mới
      await this.prisma.$transaction([
        this.prisma.refreshToken.delete({
          where: { id: storedToken.id },
        }),
        this.prisma.refreshToken.create({
          data: {
            token: hashedNewToken,
            userId: user.id,
            expiresAt,
          },
        }),
      ]);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          username: user.username,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    // Hash token client gửi
    const hashedToken = createHash('sha256').update(refreshToken).digest('hex');

    // Xoá token khỏi database để vô hiệu hoá
    const result = await this.prisma.refreshToken.deleteMany({
      where: { token: hashedToken },
    });

    if (result.count === 0) {
      throw new BadRequestException(
        'Refresh token not found or already invalidated',
      );
    }

    return { message: 'Logged out successfully' };
  }
}
