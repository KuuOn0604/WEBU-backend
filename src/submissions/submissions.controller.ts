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
