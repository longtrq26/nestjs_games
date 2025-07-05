// src/auth/guards/jwt-auth.guard.ts
import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core'; // Import Reflector
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator'; // Import IS_PUBLIC_KEY

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    // Inject Reflector
    super();
  }

  canActivate(context: ExecutionContext) {
    // Kiểm tra xem route hiện tại có được đánh dấu là public không
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Cho method handler (e.g., @Post('register'))
      context.getClass(), // Cho controller class (e.g., @Controller('auth'))
    ]);

    if (isPublic) {
      return true; // Nếu là public, bỏ qua guard và cho phép request tiếp tục
    }

    // Nếu không phải public, thực hiện xác thực JWT bình thường
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
