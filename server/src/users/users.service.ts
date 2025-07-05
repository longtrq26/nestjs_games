import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOneById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        // Chỉ chọn các trường an toàn để trả về client
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }
    return user;
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    const { username } = updateUserDto;

    // Nếu username được cung cấp, kiểm tra xem nó đã tồn tại chưa (trừ trường hợp của chính user đó)
    if (username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Username already taken by another user.');
      }
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          username, // Chỉ cập nhật username
        },
        select: {
          // Chỉ chọn các trường an toàn để trả về client
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return updatedUser;
    } catch (error) {
      // Xử lý lỗi nếu user không tìm thấy hoặc lỗi database khác
      if (error.code === 'P2025') {
        // Prisma error code for record not found
        throw new NotFoundException(`User with ID "${userId}" not found.`);
      }
      throw error; // Ném lại các lỗi khác
    }
  }
}
