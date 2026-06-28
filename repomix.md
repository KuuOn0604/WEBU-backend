This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: src/**/*.ts
- Files matching these patterns are excluded: dist, build, coverage, test, **/*.spec.ts, *.log, *.lock, .env, package-lock.json, yarn.lock, pnpm-lock.yaml, API_collection.html
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
src/app.controller.ts
src/app.module.ts
src/app.service.ts
src/auth/auth.controller.ts
src/auth/auth.module.ts
src/auth/auth.service.ts
src/auth/decorators/current-user.decorator.ts
src/auth/dto/create-auth.dto.ts
src/auth/dto/login.dto.ts
src/auth/dto/register.dto.ts
src/auth/dto/update-auth.dto.ts
src/auth/entities/auth.entity.ts
src/auth/guards/jwt-auth.guard.ts
src/auth/interfaces/jwt-payload.interface.ts
src/cards/cards.controller.ts
src/cards/cards.module.ts
src/cards/cards.service.ts
src/cards/dto/create-card.dto.ts
src/cards/dto/get-cards-filter.dto.ts
src/cards/dto/update-card.dto.ts
src/cards/entities/card.entity.ts
src/cards/schemas/cards.schema.ts
src/common/enums/difficulty-level.enum.ts
src/common/enums/language.enum.ts
src/common/enums/last-rating.enum.ts
src/common/enums/learning-mode.enum.ts
src/common/enums/role.enum.ts
src/common/enums/state.enum.ts
src/main.ts
src/submissions/dto/create-submission.dto.ts
src/submissions/dto/update-submission.dto.ts
src/submissions/entities/submission.entity.ts
src/submissions/schemas/submissions.schema.ts
src/submissions/submissions.controller.ts
src/submissions/submissions.module.ts
src/submissions/submissions.service.ts
src/test-cases/dto/create-test-case.dto.ts
src/test-cases/dto/update-test-case.dto.ts
src/test-cases/entities/test-case.entity.ts
src/test-cases/schemas/test-cases.schema.ts
src/test-cases/test-cases.controller.ts
src/test-cases/test-cases.module.ts
src/test-cases/test-cases.service.ts
src/user-progress/dto/create-user-progress.dto.ts
src/user-progress/dto/update-user-progress.dto.ts
src/user-progress/entities/user-progress.entity.ts
src/user-progress/schemas/user-progress.schema.ts
src/user-progress/user-progress.controller.ts
src/user-progress/user-progress.module.ts
src/user-progress/user-progress.service.ts
src/users/dto/create-user.dto.ts
src/users/dto/onboarding-setup.dto.ts
src/users/dto/review-card.dto.ts
src/users/entities/user.entity.ts
src/users/schemas/users.schema.ts
src/users/users.controller.ts
src/users/users.module.ts
src/users/users.service.ts
```

# Files

## File: src/common/enums/language.enum.ts
```typescript
export enum Language {
  CPP = 'cpp',
  JAVA = 'java',
  PYTHON = 'python',
}
```

## File: src/auth/auth.module.ts
```typescript
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          expiresIn: configService.get<string>('JWT_EXPIRATION', '12h') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

## File: src/auth/auth.service.ts
```typescript
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

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

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      expires_in: 43200, // 12 hours in seconds
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }
}
```

## File: src/auth/decorators/current-user.decorator.ts
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtPayload } from '../interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    return request.user;
  },
);
```

## File: src/auth/dto/create-auth.dto.ts
```typescript
export class CreateAuthDto {}
```

## File: src/auth/dto/login.dto.ts
```typescript
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
```

## File: src/auth/dto/register.dto.ts
```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;
}
```

## File: src/auth/dto/update-auth.dto.ts
```typescript
import { PartialType } from '@nestjs/swagger';

import { CreateAuthDto } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {}
```

## File: src/auth/entities/auth.entity.ts
```typescript
export class Auth {}
```

## File: src/auth/guards/jwt-auth.guard.ts
```typescript
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Không tìm thấy token xác thực');
    }
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      request.user = payload;
    } catch {
      throw new UnauthorizedException(
        'Token xác thực không hợp lệ hoặc đã hết hạn',
      );
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

## File: src/auth/interfaces/jwt-payload.interface.ts
```typescript
export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  role: string;
}
```

## File: src/cards/dto/create-card.dto.ts
```typescript
export class CreateCardDto {}
```

## File: src/cards/dto/get-cards-filter.dto.ts
```typescript
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
}
```

## File: src/cards/dto/update-card.dto.ts
```typescript
import { PartialType } from '@nestjs/mapped-types';

import { CreateCardDto } from './create-card.dto';

export class UpdateCardDto extends PartialType(CreateCardDto) {}
```

## File: src/cards/entities/card.entity.ts
```typescript
export class Card {}
```

## File: src/common/enums/difficulty-level.enum.ts
```typescript
export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}
```

## File: src/common/enums/last-rating.enum.ts
```typescript
export enum LastRating {
  HARD = 'hard',
  GOOD = 'good',
  EASY = 'easy',
}
```

## File: src/common/enums/learning-mode.enum.ts
```typescript
export enum LearningMode {
  LONG_TERM = 'long_term',
  DEADLINE = 'deadline',
}
```

## File: src/common/enums/role.enum.ts
```typescript
export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}
```

## File: src/common/enums/state.enum.ts
```typescript
export enum State {
  NEW = 'new',
  LEARNING = 'learning',
  REVIEW = 'review',
  RELEARNING = 'relearning',
}
```

## File: src/submissions/dto/create-submission.dto.ts
```typescript
export class CreateSubmissionDto {}
```

## File: src/submissions/dto/update-submission.dto.ts
```typescript
import { PartialType } from '@nestjs/mapped-types';

import { CreateSubmissionDto } from './create-submission.dto';

export class UpdateSubmissionDto extends PartialType(CreateSubmissionDto) {}
```

## File: src/submissions/entities/submission.entity.ts
```typescript
export class Submission {}
```

## File: src/test-cases/dto/create-test-case.dto.ts
```typescript
export class CreateTestCaseDto {}
```

## File: src/test-cases/dto/update-test-case.dto.ts
```typescript
import { PartialType } from '@nestjs/mapped-types';

import { CreateTestCaseDto } from './create-test-case.dto';

export class UpdateTestCaseDto extends PartialType(CreateTestCaseDto) {}
```

## File: src/test-cases/entities/test-case.entity.ts
```typescript
export class TestCase {}
```

## File: src/test-cases/schemas/test-cases.schema.ts
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'test_cases' })
export class TestCase extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Card', required: true })
  card_id!: Types.ObjectId;

  @Prop({ required: true })
  input!: string;

  @Prop({ required: true })
  expected_output!: string;

  @Prop({ default: false })
  is_hidden!: boolean;

  @Prop({ required: true })
  order!: number;
}

export const TestCaseSchema = SchemaFactory.createForClass(TestCase);
```

## File: src/test-cases/test-cases.module.ts
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TestCase, TestCaseSchema } from './schemas/test-cases.schema';
import { TestCasesController } from './test-cases.controller';
import { TestCasesService } from './test-cases.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestCase.name, schema: TestCaseSchema },
    ]),
  ],
  controllers: [TestCasesController],
  providers: [TestCasesService],
})
export class TestCasesModule {}
```

## File: src/user-progress/dto/update-user-progress.dto.ts
```typescript
import { PartialType } from '@nestjs/mapped-types';

import { CreateUserProgressDto } from './create-user-progress.dto';

export class UpdateUserProgressDto extends PartialType(CreateUserProgressDto) {}
```

## File: src/user-progress/entities/user-progress.entity.ts
```typescript
export class UserProgress {}
```

## File: src/users/dto/onboarding-setup.dto.ts
```typescript
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
} from 'class-validator';

import { LearningMode } from '../../common/enums/learning-mode.enum';

export class OnboardingSetupDto {
  @IsEnum(LearningMode)
  @IsNotEmpty()
  learning_mode!: LearningMode;

  @IsObject()
  @IsNotEmpty()
  onboarding_survey!: Record<string, unknown>;

  @IsOptional()
  @IsDateString()
  deadline_date?: string;
}
```

## File: src/users/dto/review-card.dto.ts
```typescript
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class ReviewCardDto {
  @IsString()
  @IsIn(['easy', 'good', 'hard'])
  @IsNotEmpty()
  rating!: string;
}
```

## File: src/users/entities/user.entity.ts
```typescript
export class User {}
```

## File: src/app.controller.ts
```typescript
import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

## File: src/app.service.ts
```typescript
import { Injectable } from '@nestjs/common';
// import { InjectConnection } from '@nestjs/mongoose';
// import { Connection } from 'mongoose';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

## File: src/auth/auth.controller.ts
```typescript
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

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  logout(): Promise<void> {
    return Promise.resolve();
  }
}
```

## File: src/cards/schemas/cards.schema.ts
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { DifficultyLevel } from '../../common/enums/difficulty-level.enum';

// SCHEMA PHỤ
@Schema({ _id: false })
class Content {
  @Prop({ required: true })
  question_text!: string;

  @Prop({ required: true })
  description!: string;
}
@Schema({ _id: false })
class BoilerplateCode {
  @Prop()
  java?: string;

  @Prop()
  python?: string;

  @Prop()
  cpp?: string;

  @Prop()
  typescript?: string;
}
@Schema({ _id: false })
class IdeData {
  @Prop({ type: BoilerplateCode, required: true })
  boilerplate_code!: BoilerplateCode;
  // theme, fontSize, defaultLanguage...
}
@Schema({ _id: false })
class FollowUpMcq {
  @Prop({ required: true })
  question!: string;

  @Prop({ type: [String], required: true })
  options!: string[];

  @Prop({ required: true })
  correct_index!: number;
}
// SCHEMA CHÍNH
@Schema({
  collection: 'cards',
  timestamps: { createdAt: false, updatedAt: 'updated_at' },
})
export class Card extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop()
  group!: string;

  @Prop([String])
  tags!: string[];

  @Prop({ type: Content })
  content!: Content;

  @Prop({ type: IdeData })
  ide_data!: IdeData;

  @Prop()
  ai_hint_content!: string;

  @Prop({
    type: String,
    enum: DifficultyLevel,
    default: DifficultyLevel.MEDIUM,
  })
  difficulty_level!: DifficultyLevel;
}

export const CardSchema = SchemaFactory.createForClass(Card);
```

## File: src/submissions/schemas/submissions.schema.ts
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Language } from '../../common/enums/language.enum';

@Schema({
  collection: 'submissions',
  timestamps: { createdAt: 'submitted_at', updatedAt: false },
})
export class Submission extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Card', required: true })
  card_id!: Types.ObjectId;

  @Prop({ required: true })
  submitted_code!: string;

  @Prop({ required: true, enum: Language })
  language!: Language;

  @Prop()
  status!: string;

  @Prop()
  execution_time!: number;

  @Prop()
  memory_used!: number;

  @Prop()
  error_details!: string;

  @Prop()
  hints_used_this_session!: number;

  @Prop()
  passed!: boolean;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
```

## File: src/submissions/submissions.controller.ts
```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { Submission } from './schemas/submissions.schema';
import { SubmissionsService } from './submissions.service';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  create(
    @Body() createSubmissionDto: CreateSubmissionDto,
  ): Promise<Submission> {
    return this.submissionsService.create(createSubmissionDto);
  }

  @Get()
  findAll(): Promise<Submission[]> {
    return this.submissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Submission | null> {
    return this.submissionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
  ): Promise<Submission | null> {
    return this.submissionsService.update(id, updateSubmissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Submission | null> {
    return this.submissionsService.remove(id);
  }
}
```

## File: src/submissions/submissions.module.ts
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Submission, SubmissionSchema } from './schemas/submissions.schema';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Submission.name, schema: SubmissionSchema },
    ]),
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService, MongooseModule],
})
export class SubmissionsModule {}
```

## File: src/submissions/submissions.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { Submission } from './schemas/submissions.schema';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<Submission>,
  ) {}

  async create(createSubmissionDto: CreateSubmissionDto): Promise<Submission> {
    const createdSubmission = new this.submissionModel(createSubmissionDto);
    return createdSubmission.save();
  }

  async findAll(): Promise<Submission[]> {
    return this.submissionModel.find().exec();
  }

  async findOne(id: string): Promise<Submission | null> {
    return this.submissionModel.findById(id).exec();
  }

  async update(
    id: string,
    updateSubmissionDto: UpdateSubmissionDto,
  ): Promise<Submission | null> {
    return this.submissionModel
      .findByIdAndUpdate(id, updateSubmissionDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Submission | null> {
    return this.submissionModel.findByIdAndDelete(id).exec();
  }
}
```

## File: src/test-cases/test-cases.controller.ts
```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseDto } from './dto/update-test-case.dto';
import { TestCase } from './schemas/test-cases.schema';
import { TestCasesService } from './test-cases.service';

@Controller('test-cases')
export class TestCasesController {
  constructor(private readonly testCasesService: TestCasesService) {}

  @Post()
  create(@Body() createTestCaseDto: CreateTestCaseDto): Promise<TestCase> {
    return this.testCasesService.create(createTestCaseDto);
  }

  @Get()
  findAll(): Promise<TestCase[]> {
    return this.testCasesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TestCase | null> {
    return this.testCasesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTestCaseDto: UpdateTestCaseDto,
  ): Promise<TestCase | null> {
    return this.testCasesService.update(id, updateTestCaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<TestCase | null> {
    return this.testCasesService.remove(id);
  }
}
```

## File: src/test-cases/test-cases.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseDto } from './dto/update-test-case.dto';
import { TestCase } from './schemas/test-cases.schema';

@Injectable()
export class TestCasesService {
  constructor(
    @InjectModel(TestCase.name) private readonly testCaseModel: Model<TestCase>,
  ) {}

  async create(createTestCaseDto: CreateTestCaseDto): Promise<TestCase> {
    const createdTestCase = new this.testCaseModel(createTestCaseDto);
    return createdTestCase.save();
  }

  async findAll(): Promise<TestCase[]> {
    return this.testCaseModel.find().exec();
  }

  async findOne(id: string): Promise<TestCase | null> {
    return this.testCaseModel.findById(id).exec();
  }

  async update(
    id: string,
    updateTestCaseDto: UpdateTestCaseDto,
  ): Promise<TestCase | null> {
    return this.testCaseModel
      .findByIdAndUpdate(id, updateTestCaseDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<TestCase | null> {
    return this.testCaseModel.findByIdAndDelete(id).exec();
  }
}
```

## File: src/user-progress/dto/create-user-progress.dto.ts
```typescript
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

import { LastRating } from '../../common/enums/last-rating.enum';
import { LearningMode } from '../../common/enums/learning-mode.enum';
import { State } from '../../common/enums/state.enum';

export class CreateUserProgressDto {
  @IsMongoId()
  @IsNotEmpty()
  user_id!: string;

  @IsMongoId()
  @IsNotEmpty()
  card_id!: string;

  @IsEnum(LearningMode)
  @IsOptional()
  learning_mode?: LearningMode;

  @IsOptional()
  @IsDateString()
  deadline_date?: string;

  @IsNumber()
  @IsOptional()
  total_wrong_submissions?: number;

  @IsNumber()
  @IsOptional()
  total_hints_used?: number;

  @IsEnum(State)
  @IsOptional()
  state?: State;

  @IsNumber()
  @IsOptional()
  difficulty?: number;

  @IsNumber()
  @IsOptional()
  stability?: number;

  @IsNumber()
  @IsOptional()
  reps?: number;

  @IsNumber()
  @IsOptional()
  lapses?: number;

  @IsNumber()
  @IsOptional()
  scheduled_days?: number;

  @IsOptional()
  @IsDateString()
  last_reviewed_at?: string;

  @IsOptional()
  @IsDateString()
  next_review_date?: string;

  @IsEnum(LastRating)
  @IsOptional()
  last_rating?: LastRating;
}
```

## File: src/users/dto/create-user.dto.ts
```typescript
export class CreateUserDto {
  username!: string;
  email!: string;
  password_hash!: string;
  role?: string;
}
```

## File: src/users/users.module.ts
```typescript
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { CardsModule } from '../cards/cards.module';
import { SubmissionsModule } from '../submissions/submissions.module';
import { UserProgressModule } from '../user-progress/user-progress.module';
import { User, UserSchema } from './schemas/users.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserProgressModule,
    SubmissionsModule,
    CardsModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

## File: src/cards/cards.controller.ts
```typescript
import { Controller, Get, Param, Query } from '@nestjs/common';

import { CardsService } from './cards.service';
import { GetCardsFilterDto } from './dto/get-cards-filter.dto';
import { Card } from './schemas/cards.schema';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  findAll(@Query() filterDto: GetCardsFilterDto): Promise<{
    data: Card[];
    meta: {
      total_items: number;
      current_page: number;
      total_pages: number;
    };
  }> {
    return this.cardsService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<unknown> {
    return this.cardsService.findOne(id);
  }
}
```

## File: src/cards/cards.module.ts
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Schema } from 'mongoose';

import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { Card, CardSchema } from './schemas/cards.schema';

// temp fix
const DummyTestCaseSchema = new Schema({}, { strict: false });
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Card.name, schema: CardSchema },
      { name: 'TestCase', schema: DummyTestCaseSchema },
    ]),
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService, MongooseModule],
})
export class CardsModule {}
```

## File: src/cards/cards.service.ts
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';

import { GetCardsFilterDto } from './dto/get-cards-filter.dto';
import { Card } from './schemas/cards.schema';

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Card.name) private cardModel: Model<Card>,
    @InjectModel('TestCase') private testCaseModel: Model<unknown>,
  ) {}

  async findAll(filterDto: GetCardsFilterDto): Promise<{
    data: Card[];
    meta: {
      total_items: number;
      current_page: number;
      total_pages: number;
    };
  }> {
    const { page = 1, limit = 10, tags, difficulty_level } = filterDto;
    const query: QueryFilter<Card> = {};

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }
    if (difficulty_level) {
      query.difficulty_level = difficulty_level;
    }

    const skip = (page - 1) * limit;

    const [data, total_items] = await Promise.all([
      this.cardModel.find(query).skip(skip).limit(limit).exec(),
      this.cardModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      meta: {
        total_items,
        current_page: page,
        total_pages: Math.ceil(total_items / limit),
      },
    };
  }

  async findOne(id: string): Promise<unknown> {
    const card = await this.cardModel.findById(id).exec();
    if (!card) {
      throw new NotFoundException('Không tìm thấy bài tập này');
    }

    const public_test_cases = await this.testCaseModel
      .find({ card_id: id, is_hidden: false })
      .sort({ order: 1 })
      .select('-_id input expected_output order')
      .exec();

    return {
      ...card.toJSON(),
      public_test_cases,
    };
  }
}
```

## File: src/user-progress/schemas/user-progress.schema.ts
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { LastRating } from '../../common/enums/last-rating.enum';
import { LearningMode } from '../../common/enums/learning-mode.enum';
import { State } from '../../common/enums/state.enum';

@Schema({ collection: 'user_progress' })
export class UserProgress extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Card', required: true })
  card_id!: Types.ObjectId;

  @Prop({ type: String, enum: LearningMode })
  learning_mode?: LearningMode;

  @Prop()
  deadline_date?: Date;

  @Prop({ default: 0 })
  total_wrong_submissions!: number;

  @Prop({ default: 0 })
  total_hints_used!: number;

  @Prop({ type: String, enum: State, default: State.NEW })
  state!: State;

  @Prop()
  difficulty?: number;

  @Prop()
  stability?: number;

  @Prop({ default: 0 })
  reps!: number;

  @Prop({ default: 0 })
  lapses!: number;

  @Prop()
  scheduled_days?: number;

  @Prop()
  last_reviewed_at?: Date;

  @Prop()
  next_review_date?: Date;

  @Prop({ type: String, enum: LastRating })
  last_rating?: LastRating;
}

export const UserProgressSchema = SchemaFactory.createForClass(UserProgress);
```

## File: src/user-progress/user-progress.controller.ts
```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserProgressDto } from './dto/create-user-progress.dto';
import { UpdateUserProgressDto } from './dto/update-user-progress.dto';
import { UserProgress } from './schemas/user-progress.schema';
import { UserProgressService } from './user-progress.service';

@Controller('user-progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}

  @Post()
  async create(
    @Body() createUserProgressDto: CreateUserProgressDto,
  ): Promise<UserProgress> {
    return await this.userProgressService.create(createUserProgressDto);
  }

  @Get()
  async findAll(): Promise<UserProgress[]> {
    return await this.userProgressService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserProgress> {
    return await this.userProgressService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserProgressDto: UpdateUserProgressDto,
  ): Promise<UserProgress> {
    return await this.userProgressService.update(id, updateUserProgressDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<UserProgress> {
    return await this.userProgressService.remove(id);
  }
}
```

## File: src/user-progress/user-progress.module.ts
```typescript
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { CardsModule } from '../cards/cards.module';
import {
  UserProgress,
  UserProgressSchema,
} from './schemas/user-progress.schema';
import { UserProgressController } from './user-progress.controller';
import { UserProgressService } from './user-progress.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProgress.name, schema: UserProgressSchema },
    ]),
    CardsModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UserProgressController],
  providers: [UserProgressService],
  exports: [UserProgressService, MongooseModule],
})
export class UserProgressModule {}
```

## File: src/user-progress/user-progress.service.ts
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Card } from '../cards/schemas/cards.schema';
import { LastRating } from '../common/enums/last-rating.enum';
import { State } from '../common/enums/state.enum';
import { CreateUserProgressDto } from './dto/create-user-progress.dto';
import { UpdateUserProgressDto } from './dto/update-user-progress.dto';
import { UserProgress } from './schemas/user-progress.schema';

@Injectable()
export class UserProgressService {
  constructor(
    @InjectModel(UserProgress.name)
    private readonly userProgressModel: Model<UserProgress>,
    @InjectModel(Card.name)
    private readonly cardModel: Model<Card>,
  ) {}

  async create(
    createUserProgressDto: CreateUserProgressDto,
  ): Promise<UserProgress> {
    const created = new this.userProgressModel(createUserProgressDto);
    return await created.save();
  }

  async findAll(): Promise<UserProgress[]> {
    return await this.userProgressModel.find().exec();
  }

  async findOne(id: string): Promise<UserProgress> {
    const progress = await this.userProgressModel.findById(id).exec();
    if (!progress) {
      throw new NotFoundException(
        `Không tìm thấy tiến trình ôn tập với ID: ${id}`,
      );
    }
    return progress;
  }

  async update(
    id: string,
    updateUserProgressDto: UpdateUserProgressDto,
  ): Promise<UserProgress> {
    const updated = await this.userProgressModel
      .findByIdAndUpdate(id, updateUserProgressDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(
        `Không tìm thấy tiến trình ôn tập với ID: ${id}`,
      );
    }
    return updated;
  }

  async remove(id: string): Promise<UserProgress> {
    const deleted = await this.userProgressModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(
        `Không tìm thấy tiến trình ôn tập với ID: ${id}`,
      );
    }
    return deleted;
  }

  async getDailyTasks(userId: string): Promise<
    {
      card_id: string;
      title: string;
      next_review_date: Date;
    }[]
  > {
    const now = new Date();

    // Tìm các task đến hạn ôn tập hoặc trạng thái mới
    let progressList = await this.userProgressModel
      .find({
        user_id: new Types.ObjectId(userId),
        $or: [{ next_review_date: { $lte: now } }, { state: State.NEW }],
      })
      .populate('card_id')
      .exec();

    // Nếu người dùng chưa có progress nào, lấy tối đa 5 thẻ mới để gán ôn tập
    if (progressList.length === 0) {
      const existingProgress = await this.userProgressModel
        .find({ user_id: new Types.ObjectId(userId) })
        .select('card_id')
        .exec();
      const existingCardIds = existingProgress.map((p) => p.card_id.toString());

      // Lấy các card chưa có progress
      const newCards = await this.cardModel
        .find({ _id: { $nin: existingCardIds } })
        .limit(5)
        .exec();

      const createdProgressList: UserProgress[] = [];
      for (const card of newCards) {
        const progress = new this.userProgressModel({
          user_id: new Types.ObjectId(userId),
          card_id: card._id,
          state: State.NEW,
          difficulty: 5,
          stability: 2,
          reps: 0,
          lapses: 0,
          next_review_date: now,
        });
        await progress.save();
        createdProgressList.push(progress);
      }

      if (createdProgressList.length > 0) {
        progressList = await this.userProgressModel
          .find({ _id: { $in: createdProgressList.map((p) => p._id) } })
          .populate('card_id')
          .exec();
      }
    }

    return progressList
      .filter((p) => p.card_id) // Lọc bỏ nếu card_id không tồn tại (do db mồ côi)
      .map((p) => {
        const card = p.card_id as unknown as Card;
        const cardId = card._id.toString();
        return {
          card_id: cardId,
          title: card.title,
          next_review_date: p.next_review_date!,
        };
      });
  }

  async reviewCard(
    userId: string,
    cardId: string,
    rating: string,
  ): Promise<void> {
    const progress = await this.userProgressModel
      .findOne({
        user_id: new Types.ObjectId(userId),
        card_id: new Types.ObjectId(cardId),
      })
      .exec();

    if (!progress) {
      throw new NotFoundException(
        'Không tìm thấy tiến trình ôn tập cho bài tập này',
      );
    }

    const now = new Date();
    let scheduled_days = progress.scheduled_days || 1;
    let difficulty = progress.difficulty || 5;
    let stability = progress.stability || 2;
    let reps = progress.reps || 0;
    let lapses = progress.lapses || 0;

    // Chuyển rating thành enum
    let lastRatingEnum: LastRating = LastRating.GOOD;
    if (rating === 'easy') lastRatingEnum = LastRating.EASY;
    if (rating === 'hard') lastRatingEnum = LastRating.HARD;

    if (reps === 0) {
      reps = 1;
      if (rating === 'easy') {
        scheduled_days = 4;
        difficulty = 3;
        stability = 4;
      } else if (rating === 'good') {
        scheduled_days = 2;
        difficulty = 4;
        stability = 2;
      } else {
        scheduled_days = 1;
        difficulty = 5;
        stability = 1;
      }
    } else {
      reps += 1;
      if (rating === 'easy') {
        scheduled_days = Math.ceil(scheduled_days * 2.5);
        difficulty = Math.max(1, difficulty - 1);
        stability = Math.ceil(stability * 2.0);
      } else if (rating === 'good') {
        scheduled_days = Math.ceil(scheduled_days * 1.8);
        stability = Math.ceil(stability * 1.5);
      } else {
        scheduled_days = 1;
        difficulty = Math.min(10, difficulty + 1);
        stability = Math.max(1, Math.floor(stability * 0.5));
        lapses += 1;
      }
    }

    progress.reps = reps;
    progress.difficulty = difficulty;
    progress.stability = stability;
    progress.scheduled_days = scheduled_days;
    progress.lapses = lapses;
    progress.last_reviewed_at = now;
    progress.next_review_date = new Date(
      now.getTime() + scheduled_days * 24 * 3600 * 1000,
    );
    progress.last_rating = lastRatingEnum;
    progress.state = rating === 'hard' ? State.LEARNING : State.REVIEW;

    await progress.save();
    return;
  }

  async getProgressStats(userId: string): Promise<{
    total_cards_mastered: number;
    average_retention_rate: number;
  }> {
    const total_cards_mastered = await this.userProgressModel
      .countDocuments({
        user_id: new Types.ObjectId(userId),
        state: State.REVIEW,
      })
      .exec();

    const progressRecords = await this.userProgressModel
      .find({
        user_id: new Types.ObjectId(userId),
      })
      .exec();

    let total_reviews = 0;
    let total_lapses = 0;

    progressRecords.forEach((p) => {
      total_reviews += p.reps || 0;
      total_lapses += p.lapses || 0;
    });

    const average_retention_rate =
      total_reviews > 0
        ? Math.max(
            0,
            Math.min(
              100,
              Math.round((1 - total_lapses / total_reviews) * 1000) / 10,
            ),
          )
        : 100.0;

    return {
      total_cards_mastered,
      average_retention_rate,
    };
  }
}
```

## File: src/users/schemas/users.schema.ts
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { LearningMode } from '../../common/enums/learning-mode.enum';
import { Role } from '../../common/enums/role.enum';

// SCHEMA PHỤ
@Schema({ _id: false })
export class OnboardingSurvey {
  @Prop()
  level!: string;

  @Prop()
  goals!: string[];
}
// SCHEMA CHÍNH
@Schema({
  collection: 'users',
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class User extends Document {
  @Prop({ required: true })
  username!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password_hash!: string;

  @Prop({ type: String, enum: Role, default: Role.USER })
  role!: Role;

  @Prop({ type: OnboardingSurvey })
  onboarding_survey!: OnboardingSurvey;

  @Prop({ type: String, enum: LearningMode })
  learning_mode?: LearningMode;

  @Prop()
  deadline_date?: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Card' }] })
  bookmarked!: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
```

## File: src/users/users.controller.ts
```typescript
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { OnboardingSetupDto } from './dto/onboarding-setup.dto';
import { ReviewCardDto } from './dto/review-card.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Cấu hình onboarding cho user
  @Put('me/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateSetup(
    @CurrentUser() user: JwtPayload,
    @Body() setupDto: OnboardingSetupDto,
  ): Promise<{
    status: string;
    message: string;
    updated_at: Date;
  }> {
    return this.usersService.updateSetup(user.sub, setupDto);
  }

  // Lấy nhiệm vụ ôn tập hàng ngày
  @Get('me/daily-tasks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getDailyTasks(@CurrentUser() user: JwtPayload): Promise<
    {
      card_id: string;
      title: string;
      next_review_date: Date;
    }[]
  > {
    return this.usersService.getDailyTasks(user.sub);
  }

  // Đánh giá độ khó sau khi ôn tập
  @Post('me/daily-tasks/:card_id/review')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  reviewCard(
    @CurrentUser() user: JwtPayload,
    @Param('card_id') cardId: string,
    @Body() reviewCardDto: ReviewCardDto,
  ): Promise<void> {
    return this.usersService.reviewCard(user.sub, cardId, reviewCardDto.rating);
  }

  // Xem Dashboard thống kê
  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getStats(@CurrentUser() user: JwtPayload): Promise<{
    total_cards_mastered: number;
    average_retention_rate: number;
    submission_history: {
      date: string;
      count: number;
    }[];
  }> {
    return this.usersService.getStats(user.sub);
  }
}
```

## File: src/users/users.service.ts
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Submission } from '../submissions/schemas/submissions.schema';
import { UserProgressService } from '../user-progress/user-progress.service';
import { CreateUserDto } from './dto/create-user.dto';
import { OnboardingSetupDto } from './dto/onboarding-setup.dto';
import { OnboardingSurvey, User } from './schemas/users.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<Submission>,
    private readonly userProgressService: UserProgressService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async updateSetup(
    userId: string,
    setupDto: OnboardingSetupDto,
  ): Promise<{
    status: string;
    message: string;
    updated_at: Date;
  }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng');
    }

    user.learning_mode = setupDto.learning_mode;
    user.onboarding_survey =
      setupDto.onboarding_survey as unknown as OnboardingSurvey;
    if (setupDto.deadline_date) {
      user.deadline_date = new Date(setupDto.deadline_date);
    } else {
      user.deadline_date = undefined;
    }

    await user.save();

    return {
      status: 'success',
      message: 'Cập nhật khảo sát và chế độ học thành công',
      updated_at: new Date(),
    };
  }

  async getDailyTasks(userId: string): Promise<
    {
      card_id: string;
      title: string;
      next_review_date: Date;
    }[]
  > {
    return await this.userProgressService.getDailyTasks(userId);
  }

  async reviewCard(
    userId: string,
    cardId: string,
    rating: string,
  ): Promise<void> {
    return await this.userProgressService.reviewCard(userId, cardId, rating);
  }

  async getStats(userId: string): Promise<{
    total_cards_mastered: number;
    average_retention_rate: number;
    submission_history: {
      date: string;
      count: number;
    }[];
  }> {
    const { total_cards_mastered, average_retention_rate } =
      await this.userProgressService.getProgressStats(userId);

    const submission_history = await this.submissionModel
      .aggregate<{
        date: string;
        count: number;
      }>([
        { $match: { user_id: new Types.ObjectId(userId) } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$submitted_at' },
            },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, date: '$_id', count: 1 } },
        { $sort: { date: 1 } },
      ])
      .exec();

    return {
      total_cards_mastered,
      average_retention_rate,
      submission_history,
    };
  }
}
```

## File: src/app.module.ts
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection, Schema } from 'mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './cards/cards.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { TestCasesModule } from './test-cases/test-cases.module';
import { UserProgressModule } from './user-progress/user-progress.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    CardsModule,
    TestCasesModule,
    UserProgressModule,
    SubmissionsModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        connectionFactory: (connection: Connection) => {
          connection.plugin((schema: Schema) => {
            schema.set('toJSON', {
              virtuals: true,
              versionKey: false,
              transform: (_doc: unknown, ret: Record<string, unknown>) => {
                delete ret._id;
                return ret;
              },
            });
            schema.set('toObject', { virtuals: true });
          });
          return connection;
        },
      }),
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## File: src/main.ts
```typescript
import * as dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('W.E.B.U API')
    .setDescription('Tài liệu API cho hệ thống học thuật toán W.E.B.U')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
```
