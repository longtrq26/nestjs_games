import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { hash, compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { username, password } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await hash(password, 10);

    await this.prisma.user.create({
      data: {
        username,
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

    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Tạo JWT payload
    const payload = { sub: user.id, username: user.username };

    // Tạo Access Token
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessTokenSecret'),
      expiresIn: this.configService.get<string>(
        'jwt.accessTokenExpirationTime',
      ),
    });

    // Tạo Refresh Token
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshTokenSecret'),
      expiresIn: this.configService.get<string>(
        'jwt.refreshTokenExpirationTime',
      ),
    });

    // Lưu Refresh Token vào DB
    const refreshTokenExpirationTime =
      this.configService.get<string>('jwt.refreshTokenExpirationTime') ?? '7d';
    const expiresAt = new Date(
      Date.now() + this.parseJwtExpiration(refreshTokenExpirationTime),
    );

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username },
    };
  }

  async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; username: string };
  }> {
    try {
      // Xác thực refresh token
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshTokenSecret'),
      });

      // Kiểm tra xem refresh token có tồn tại trong DB và chưa hết hạn không
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (
        !storedToken ||
        !storedToken.user ||
        storedToken.expiresAt < new Date()
      ) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Xóa refresh token cũ khỏi DB (để đảm bảo refresh token chỉ được dùng 1 lần)
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      // Tạo cặp token mới
      const newPayload = {
        sub: storedToken.user.id,
        username: storedToken.user.username,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>('jwt.accessTokenSecret'),
        expiresIn: this.configService.get<string>(
          'jwt.accessTokenExpirationTime',
        ),
      });

      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>('jwt.refreshTokenSecret'),
        expiresIn: this.configService.get<string>(
          'jwt.refreshTokenExpirationTime',
        ),
      });

      // Lưu refresh token mới vào DB
      const refreshTokenExpirationTime =
        this.configService.get<string>('jwt.refreshTokenExpirationTime') ??
        '7d';
      const expiresAt = new Date(
        Date.now() + this.parseJwtExpiration(refreshTokenExpirationTime),
      );

      await this.prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: storedToken.user.id,
          expiresAt: expiresAt,
        },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: { id: storedToken.user.id, username: storedToken.user.username },
      };
    } catch (error) {
      // Xử lý các lỗi JWT (ví dụ: TokenExpiredError, JsonWebTokenError)
      if (error.name === 'TokenExpiredError') {
        // Nếu refresh token đã hết hạn, xóa nó khỏi DB nếu có
        await this.prisma.refreshToken.deleteMany({
          where: { token: refreshToken },
        });
        throw new UnauthorizedException('Refresh token expired');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    // Xóa refresh token khỏi DB để vô hiệu hóa
    const result = await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    if (result.count === 0) {
      throw new BadRequestException(
        'Refresh token not found or already invalidated',
      );
    }

    return { message: 'Logged out successfully' };
  }

  private parseJwtExpiration(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1));

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return parseInt(expiration);
    }
  }
}
