import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto): Promise<{
    message: string;
    data: {
      id: string;
      username: string;
      email: string;
    };
  }> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto): Promise<{
    token: string;
    expires_in: number;
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
    };
  }> {
    return this.authService.login(loginDto);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  googleLogin(@Body() googleLoginDto: GoogleLoginDto): Promise<{
    token?: string;
    expires_in?: number;
    user?: {
      id: string;
      username: string;
      email: string;
      role: string;
    };
    requirePassword?: boolean;
    email?: string;
  }> {
    return this.authService.googleLogin(googleLoginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  logout(): Promise<void> {
    return Promise.resolve();
  }
}
