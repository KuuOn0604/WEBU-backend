import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { DifficultyLevel } from '../../common/enums/difficulty-level.enum';

export class CreateCardDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsEnum(DifficultyLevel)
  difficulty_level!: DifficultyLevel;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  course!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsNotEmpty()
  boilerplate_code!: {
    cpp: string;
    java: string;
    python: string;
    typescript: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  testcases?: Array<{
    input: string;
    expected_output: string;
    is_hidden: boolean;
    order?: number;
  }>;
}
