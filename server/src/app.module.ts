import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/config.module';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { UsersModule } from './users/users.module';
import { TicTacToeModule } from './tic-tac-toe/tic-tac-toe.module';
import { Line98Module } from './line98/line98.module';

@Module({
  imports: [AppConfigModule, AuthModule, UsersModule, TicTacToeModule, Line98Module],
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
