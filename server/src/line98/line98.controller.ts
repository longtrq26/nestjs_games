import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Line98Service } from './line98.service';
import {
  CreateLine98GameDto,
  GetHintDto,
  Line98GameStatePayload,
  MoveBallDto,
} from './dto/line98.dto';

interface AuthenticatedRequest extends Request {
  user: { userId: string; username: string };
}

@UseGuards(JwtAuthGuard)
@Controller('line98')
export class Line98Controller {
  constructor(private readonly line98Service: Line98Service) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  async createGame(
    @Req() req: AuthenticatedRequest,
    @Body() createGameDto: CreateLine98GameDto,
  ) {
    try {
      const game = await this.line98Service.createGame(req.user.userId);
      return {
        message: 'Line 98 game created successfully',
        gameId: game.id,
      };
    } catch (err) {
      console.error('Failed to create game', err);
      throw err;
    }
  }

  @Get(':gameId')
  @HttpCode(HttpStatus.OK)
  async getGameState(
    @Param('gameId') gameId: string,
  ): Promise<Line98GameStatePayload> {
    return this.line98Service.getGameState(gameId);
  }

  @Post('move')
  @HttpCode(HttpStatus.OK)
  async moveBall(
    @Req() req: AuthenticatedRequest,
    @Body() moveBallDto: MoveBallDto,
  ): Promise<Line98GameStatePayload> {
    return this.line98Service.moveBall(
      moveBallDto.gameId,
      req.user.userId,
      moveBallDto.from,
      moveBallDto.to,
    );
  }

  @Post('hint')
  @HttpCode(HttpStatus.OK)
  async getHint(
    @Req() req: AuthenticatedRequest,
    @Body() getHintDto: GetHintDto,
  ) {
    const hint = await this.line98Service.getHint(
      getHintDto.gameId,
      req.user.userId,
    );
    if (!hint) {
      return { message: 'No hint available or game finished.' };
    }
    return {
      message: 'Optimal move hint',
      hint: hint,
    };
  }
}
