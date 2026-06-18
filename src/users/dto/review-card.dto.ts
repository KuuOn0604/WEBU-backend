import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class ReviewCardDto {
  @IsString()
  @IsIn(['easy', 'good', 'hard'])
  @IsNotEmpty()
  rating!: string;
}
