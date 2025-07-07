import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/lib/constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Kiểm tra xem route hiện tại có được đánh dấu là public không
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // method handler
      context.getClass(), // controller class
    ]);

    if (isPublic) {
      return true; // bỏ qua guard và cho phép request tiếp tục
    }

    // xác thực jwt
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      console.warn('JWT Auth failed:', info?.message || err?.message);
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
