import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { DifficultyLevel } from '../../common/enums/difficulty-level.enum';

export class GetCardsFilterDto {
  @ApiPropertyOptional({
    description: 'Số trang hiện tại',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng bài tập mỗi trang',
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Lọc theo tags',
    example: 'Array,Two Pointers',
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo độ khó',
    enum: ['easy', 'medium', 'hard'],
  })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty_level?: DifficultyLevel;

  @ApiPropertyOptional({
    description: 'Tìm kiếm theo tiêu đề bài tập (không phân biệt hoa thường)',
    example: 'two sum',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo nhóm bài tập',
    example: 'Arrays & Hashing',
  })
  @IsOptional()
  @IsString()
  group?: string;
}
