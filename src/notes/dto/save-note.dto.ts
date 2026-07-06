import { IsNotEmpty, IsString } from 'class-validator';

export class SaveNoteDto {
  @IsNotEmpty()
  @IsString()
  user_id!: string;

  @IsNotEmpty()
  @IsString()
  card_id!: string;

  @IsString()
  content!: string;
}
