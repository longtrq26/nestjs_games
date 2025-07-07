import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from 'src/lib/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() { refreshToken }: RefreshTokenDto) {
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() { refreshToken }: RefreshTokenDto) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required for logout.');
    }

    return this.authService.logout(refreshToken);
  }
}
