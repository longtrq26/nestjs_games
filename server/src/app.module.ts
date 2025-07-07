import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import Configuration from './config';
import { Line98Module } from './line98/line98.module';
import { PrismaService } from './prisma/prisma.service';
import { TicTacToeModule } from './tic-tac-toe/tic-tac-toe.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [Configuration],
      isGlobal: true,
    }),

    AuthModule,
    UsersModule,
    TicTacToeModule,
    Line98Module,
  ],
  controllers: [],
  providers: [
    PrismaService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
