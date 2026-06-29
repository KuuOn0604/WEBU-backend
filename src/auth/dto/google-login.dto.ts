import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  idToken!: string;

  /** Chỉ truyền khi Branch B: tài khoản email đã tồn tại và cần verify password */
  @IsOptional()
  @IsString()
  @MaxLength(128, { message: 'Password is too long' })
  password?: string;
}
