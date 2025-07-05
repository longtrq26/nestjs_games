import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() // Đánh dấu endpoint này là public, không cần xác thực
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public() // Đánh dấu endpoint này là public
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public() // Đánh dấu endpoint này là public
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard) // Bảo vệ endpoint này bằng JwtAuthGuard
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    // Lấy refresh token từ header hoặc cookie.
    // Tốt nhất là từ cookie HttpOnly để bảo mật.
    // Hiện tại, chúng ta sẽ giả sử refresh token được gửi trong body hoặc header Authorization (không lý tưởng cho refresh token)
    // Để đơn giản cho MVP, chúng ta sẽ tiếp tục nhận nó từ body.
    // Trong thực tế, bạn sẽ gửi access token trong header Authorization,
    // và refresh token trong HttpOnly cookie hoặc một nơi khác an toàn.
    // Với setup hiện tại, chỉ access token được kiểm tra. Để logout refresh token cụ thể, client cần gửi nó đi.
    // Đây là một cách tiếp cận đơn giản cho MVP: client gửi refresh token cần logout.
    const refreshToken = (req.body as RefreshTokenDto).refreshToken; // Lấy từ body (cần client gửi)
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required for logout.');
    }
    return this.authService.logout(refreshToken);
  }
}
