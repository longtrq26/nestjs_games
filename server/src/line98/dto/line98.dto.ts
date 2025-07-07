import { IsNotEmpty, IsNumber, IsUUID, Max, Min } from 'class-validator';
import { TOTAL_CELLS } from 'src/lib/constants';

export class MoveBallDto {
  @IsUUID()
  @IsNotEmpty()
  gameId: string;

  @IsNumber()
  @Min(0)
  @Max(TOTAL_CELLS - 1)
  from: number;

  @IsNumber()
  @Min(0)
  @Max(TOTAL_CELLS - 1)
  to: number;
}

export class GetHintDto {
  @IsUUID()
  @IsNotEmpty()
  gameId: string;
}
