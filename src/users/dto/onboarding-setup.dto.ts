import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
} from 'class-validator';

import { LearningMode } from '../../common/enums/learning-mode.enum';

export class OnboardingSetupDto {
  @IsEnum(LearningMode)
  @IsNotEmpty()
  learning_mode!: LearningMode;

  @IsObject()
  @IsNotEmpty()
  onboarding_survey!: Record<string, unknown>;

  @IsOptional()
  @IsDateString()
  deadline_date?: string;
}
