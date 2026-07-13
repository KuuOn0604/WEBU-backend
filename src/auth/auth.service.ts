import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

import { UsersService } from '../users/users.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async register(registerDto: RegisterDto): Promise<{
    message: string;
    data: {
      id: string;
      username: string;
      email: string;
    };
  }> {
    const { username, email, password } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await this.usersService.create({
      username,
      email,
      password_hash,
    });

    return {
      message: 'Tạo tài khoản thành công',
      data: {
        id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<{
    token: string;
    expires_in: number;
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
    };
  }> {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    if (!user.password_hash) {
      throw new UnauthorizedException(
        'Tài khoản này sử dụng đăng nhập Google. Vui lòng đăng nhập bằng Google.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const payload = {
      sub: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };

    let token: string;
    try {
      token = await this.jwtService.signAsync(payload);
    } catch {
      throw new InternalServerErrorException('Lỗi tạo token xác thực');
    }

    return {
      token,
      expires_in: 43200,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Google Sign-In handler - xử lý 3 nhánh:
   * A: googleId đã tồn tại → đăng nhập thẳng
   * B: email đã tồn tại nhưng chưa liên kết Google → yêu cầu password để link
   * C: không tìm thấy → tạo tài khoản mới bằng Google
   */
  async googleLogin(googleLoginDto: GoogleLoginDto): Promise<{
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
    const { idToken, password } = googleLoginDto;

    // Xác thực Google Token
    let payload: {
      sub: string;
      email: string;
      name: string;
      picture?: string;
      email_verified?: boolean;
    };
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });
      const p = ticket.getPayload();
      if (!p || !p.sub || !p.email) {
        throw new UnauthorizedException('Google token không hợp lệ');
      }
      payload = {
        sub: p.sub,
        email: p.email,
        name: p.name ?? p.email.split('@')[0],
        picture: p.picture,
        email_verified: p.email_verified,
      };
    } catch {
      throw new UnauthorizedException(
        'Xác thực Google thất bại. Token không hợp lệ hoặc đã hết hạn.',
      );
    }

    const { sub: googleId, email, name, picture } = payload;

    // ── Nhánh A: googleId đã tồn tại → đăng nhập thẳng ─────────────────
    const existingByGoogle = await this.usersService.findByGoogleId(googleId);
    if (existingByGoogle) {
      const tokenPayload = {
        sub: existingByGoogle._id.toString(),
        username: existingByGoogle.username,
        email: existingByGoogle.email,
        role: existingByGoogle.role,
      };
      let token: string;
      try {
        token = await this.jwtService.signAsync(tokenPayload);
      } catch {
        throw new InternalServerErrorException('Lỗi tạo token xác thực');
      }
      return {
        token,
        expires_in: 43200,
        user: {
          id: existingByGoogle._id.toString(),
          username: existingByGoogle.username,
          email: existingByGoogle.email,
          role: existingByGoogle.role,
        },
      };
    }

    // ── Nhánh B: email đã tồn tại, chưa liên kết Google ─────────────────
    const existingByEmail = await this.usersService.findByEmail(email);
    if (existingByEmail) {
      // Branch B, step 1: chưa có password → yêu cầu password
      if (!password) {
        return { requirePassword: true, email };
      }

      // Branch B, step 2: kiểm tra password rồi link
      if (!existingByEmail.password_hash) {
        throw new UnauthorizedException('Mật khẩu không đúng');
      }
      const isValid = await bcrypt.compare(
        password,
        existingByEmail.password_hash,
      );
      if (!isValid) {
        throw new UnauthorizedException('Mật khẩu không đúng');
      }

      // Link googleId vào tài khoản hiện có
      await this.usersService.linkGoogleId(
        existingByEmail._id.toString(),
        googleId,
        picture,
      );

      const tokenPayload = {
        sub: existingByEmail._id.toString(),
        username: existingByEmail.username,
        email: existingByEmail.email,
        role: existingByEmail.role,
      };
      let token: string;
      try {
        token = await this.jwtService.signAsync(tokenPayload);
      } catch {
        throw new InternalServerErrorException('Lỗi tạo token xác thực');
      }
      return {
        token,
        expires_in: 43200,
        user: {
          id: existingByEmail._id.toString(),
          username: existingByEmail.username,
          email: existingByEmail.email,
          role: existingByEmail.role,
        },
      };
    }

    // ── Nhánh C: chưa có tài khoản → tạo mới ────────────────────────────
    const username = name ?? email.split('@')[0];
    const newUser = await this.usersService.create({
      username,
      email,
      googleId,
      avatar: picture,
    });

    const tokenPayload = {
      sub: newUser._id.toString(),
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    };
    let token: string;
    try {
      token = await this.jwtService.signAsync(tokenPayload);
    } catch {
      throw new InternalServerErrorException('Lỗi tạo token xác thực');
    }
    return {
      token,
      expires_in: 43200,
      user: {
        id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    };
  }
}
