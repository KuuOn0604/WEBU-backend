import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

import { LastRating } from '../../common/enums/last-rating.enum';
import { LearningMode } from '../../common/enums/learning-mode.enum';
import { State } from '../../common/enums/state.enum';

export class CreateUserProgressDto {
  @IsMongoId()
  @IsNotEmpty()
  user_id!: string;

  @IsMongoId()
  @IsNotEmpty()
  card_id!: string;

  @IsEnum(LearningMode)
  @IsOptional()
  learning_mode?: LearningMode;

  @IsOptional()
  @IsDateString()
  deadline_date?: string;

  @IsNumber()
  @IsOptional()
  total_wrong_submissions?: number;

  @IsNumber()
  @IsOptional()
  total_hints_used?: number;

  @IsEnum(State)
  @IsOptional()
  state?: State;

  @IsNumber()
  @IsOptional()
  difficulty?: number;

  @IsNumber()
  @IsOptional()
  stability?: number;

  @IsNumber()
  @IsOptional()
  reps?: number;

  @IsNumber()
  @IsOptional()
  lapses?: number;

  @IsNumber()
  @IsOptional()
  scheduled_days?: number;

  @IsOptional()
  @IsDateString()
  last_reviewed_at?: string;

  @IsOptional()
  @IsDateString()
  next_review_date?: string;

  @IsEnum(LastRating)
  @IsOptional()
  last_rating?: LastRating;
}
