import { IsNotEmpty, IsString } from 'class-validator';

import { Language } from '@/common/enums/language.enum';

export class GetHintDto {
  @IsString()
  @IsNotEmpty()
  problem_description!: string;

  @IsString()
  @IsNotEmpty()
  user_code!: string;

  @IsString()
  @IsNotEmpty()
  language!: Language;
}
