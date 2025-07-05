// src/auth/guards/jwt-ws-auth.guard.ts (thêm logs để debug)
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class JwtWsAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtWsAuthGuard.name); // Thêm logger
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: any = context.switchToWs().getClient();
    const headers = client.handshake.headers;
    const query = client.handshake.query;

    let token: string | undefined = client.handshake.auth?.token;

    if (headers.authorization && headers.authorization.startsWith('Bearer ')) {
      token = headers.authorization.split(' ')[1];
    } else if (query.token) {
      token = Array.isArray(query.token) ? query.token[0] : query.token;
    }

    if (!token) {
      this.logger.warn('No token provided for WebSocket connection.');
      throw new WsException('Unauthorized - No token provided');
    }

    try {
      this.logger.debug(`Attempting to verify token: ${token}`);
      const payload: JwtPayload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.accessTokenSecret'),
      });
      this.logger.debug(`Token verified, payload: ${JSON.stringify(payload)}`);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, username: true },
      });

      if (!user) {
        this.logger.warn(`User with ID ${payload.sub} not found in DB.`);
        throw new WsException('Unauthorized - User not found');
      }

      client.data.user = user;
      this.logger.log(
        `WebSocket connection authenticated for user: ${user.username} (ID: ${user.id})`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `WebSocket authentication error: ${error.message}`,
        error.stack,
      );
      if (error.name === 'TokenExpiredError') {
        throw new WsException('Unauthorized - Access token expired');
      }
      throw new WsException('Unauthorized - Invalid token');
    }
  }
}
