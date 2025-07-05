import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

interface AuthenticatedRequest extends Request {
  user: { userId: string; username: string };
}

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    // Lấy userId từ đối tượng user đã được JwtAuthGuard gắn vào req
    return this.usersService.findOneById(req.user.userId);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async updateMyProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // Lấy userId từ đối tượng user đã được JwtAuthGuard gắn vào req
    return this.usersService.update(req.user.userId, updateUserDto);
  }
}
