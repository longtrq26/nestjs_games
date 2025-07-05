// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

// Định nghĩa interface cho JWT payload
export interface JwtPayload {
  sub: string; // User ID
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secretOrKey = configService.get<string>('jwt.accessTokenSecret');

    if (!secretOrKey) {
      throw new Error('JWT access token secret is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Lấy JWT từ header Authorization: Bearer <token>
      ignoreExpiration: false, // Không bỏ qua việc kiểm tra thời hạn token
      secretOrKey, // Secret key để giải mã access token
    });
  }

  // Hàm validate sẽ được gọi sau khi JWT được giải mã thành công
  // Nó sẽ nhận payload đã giải mã và trả về đối tượng user để gắn vào request (req.user)
  async validate(payload: JwtPayload) {
    // Bạn có thể tùy chọn tìm user trong DB ở đây để đảm bảo user vẫn tồn tại
    // Hoặc chỉ trả về payload nếu bạn tin tưởng vào JWT
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      // Có thể throw lỗi nếu user không tồn tại, hoặc trả về null để Passport xử lý lỗi
      return null;
    }

    // Trả về một đối tượng user sẽ được gắn vào req.user
    // Không nên trả về password
    return { userId: user.id, username: user.username };
  }
}
