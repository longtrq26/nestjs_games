import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class JwtWsAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = this.extractTokenFromHandshake(client);

    if (!token) {
      throw new WsException('Unauthorized - Missing token');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('jwt.accessTokenSecret'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, username: true },
      });

      if (!user) {
        throw new WsException('Unauthorized - User not found');
      }

      // Attach user vào socket
      client.data.user = user;
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new WsException('Unauthorized - Token expired');
      }
      throw new WsException('Unauthorized - Invalid token');
    }
  }

  // auth > headers > query
  private extractTokenFromHandshake(client: any): string | undefined {
    const authToken = client.handshake.auth?.token;
    const headerAuth = client.handshake.headers?.authorization;
    const queryToken = client.handshake.query?.token;

    if (authToken) return authToken;

    if (headerAuth?.startsWith('Bearer ')) {
      return headerAuth.split(' ')[1];
    }

    if (Array.isArray(queryToken)) {
      return queryToken[0];
    }

    return queryToken;
  }
}
