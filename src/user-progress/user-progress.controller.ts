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
