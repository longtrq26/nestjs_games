import { Module } from '@nestjs/common';
import { TicTacToeService } from './tic-tac-toe.service';
import { TicTacToeGateway } from './tic-tac-toe.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtWsAuthGuard } from 'src/auth/guards/jwt-ws-auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';

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
    PrismaService,
    JwtWsAuthGuard,
  ],
  exports: [TicTacToeService],
})
export class TicTacToeModule {}
