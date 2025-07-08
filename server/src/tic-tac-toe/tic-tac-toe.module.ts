import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtWsAuthGuard } from 'src/auth/guards/jwt-ws-auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocketToGameService } from './socket-to-game.service';
import { TicTacToeGateway } from './tic-tac-toe.gateway';
import { TicTacToeService } from './tic-tac-toe.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessTokenSecret'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  providers: [
    TicTacToeService,
    TicTacToeGateway,
    SocketToGameService,
    PrismaService,
    JwtWsAuthGuard,
  ],
  exports: [TicTacToeService],
})
export class TicTacToeModule {}
