import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateUserProgressDto } from './dto/create-user-progress.dto';
import { UpdateUserProgressDto } from './dto/update-user-progress.dto';
import { UserProgressService } from './user-progress.service';

@Controller('user-progress')
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}

  @Post()
  create(@Body() createUserProgressDto: CreateUserProgressDto): string {
    return this.userProgressService.create(createUserProgressDto);
  }

  @Get()
  findAll(): string {
    return this.userProgressService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return this.userProgressService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserProgressDto: UpdateUserProgressDto,
  ): string {
    return this.userProgressService.update(+id, updateUserProgressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): string {
    return this.userProgressService.remove(+id);
  }
}
