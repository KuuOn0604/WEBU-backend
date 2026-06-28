export class CreateUserDto {
  username!: string;
  email!: string;
  password_hash?: string;
  googleId?: string;
  avatar?: string;
  role?: string;
}
