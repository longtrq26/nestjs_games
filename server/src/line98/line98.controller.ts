import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/lib/decorators/current-user.decorator';
import { Line98GameStatePayload, Line98Response } from 'src/lib/types';
import { GetHintDto, MoveBallDto } from './dto/line98.dto';
import { Line98Service } from './line98.service';

@UseGuards(JwtAuthGuard)
@Controller('line98')
export class Line98Controller {
  constructor(private readonly line98Service: Line98Service) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  async createGame(
    @CurrentUser() user: { userId: string },
    @Body() _unused: any,
  ): Promise<Line98Response<{ gameId: string }>> {
    const game = await this.line98Service.createGame(user.userId);

    return {
      message: 'Line 98 game created successfully',
      data: { gameId: game.id },
    };
  }

  @Get(':gameId')
  @HttpCode(HttpStatus.OK)
  async getGameState(
    @Param('gameId') gameId: string,
  ): Promise<Line98Response<Line98GameStatePayload>> {
    const state = await this.line98Service.getGameState(gameId);

    return {
      message: 'Game state fetched successfully',
      data: state,
    };
  }

  @Post('move')
  @HttpCode(HttpStatus.OK)
  async moveBall(
    @CurrentUser() user: { userId: string },
    @Body() moveBallDto: MoveBallDto,
  ): Promise<Line98Response<Line98GameStatePayload>> {
    const state = await this.line98Service.moveBall(
      moveBallDto.gameId,
      user.userId,
      moveBallDto.from,
      moveBallDto.to,
    );

    return {
      message: 'Ball moved successfully',
      data: state,
    };
  }

  @Post('hint')
  @HttpCode(HttpStatus.OK)
  async getHint(
    @CurrentUser() user: { userId: string },
    @Body() getHintDto: GetHintDto,
  ): Promise<Line98Response<{ hint: any } | null>> {
    const hint = await this.line98Service.getHint(
      getHintDto.gameId,
      user.userId,
    );

    if (!hint) {
      return {
        message: 'No hint available or game finished.',
        data: null,
      };
    }

    return {
      message: 'Optimal move hint',
      data: { hint },
    };
  }
}
