import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/lib/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyProfile(
    @CurrentUser() user: { userId: string; username: string },
  ) {
    return this.usersService.findOneById(user.userId);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async updateMyProfile(
    @CurrentUser() user: { userId: string; username: string },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.userId, updateUserDto);
  }
}
