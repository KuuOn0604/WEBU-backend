import { IsEnum, IsMongoId, IsString } from 'class-validator';

import { Language } from '../../common/enums/language.enum';

export class RunCodeDto {
  @IsMongoId()
  card_id!: string;

  @IsString()
  code!: string;

  @IsEnum(Language)
  language!: Language;
}
