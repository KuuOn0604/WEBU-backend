import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { RunCodeDto } from './dto/run-code.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { Submission } from './schemas/submissions.schema';
import {
  RunCodeResult,
  SubmissionsService,
  SubmitResult,
} from './submissions.service';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  /**
   * POST /api/submissions/run
   * Chạy code với public test cases, không lưu DB
   */
  @Post('run')
  runCode(@Body() runCodeDto: RunCodeDto): Promise<RunCodeResult> {
    return this.submissionsService.runCode(runCodeDto);
  }

  /**
   * POST /api/submissions/submit
   * Submit code đầy đủ, cần JWT auth
   */
  @Post('submit')
  @UseGuards(JwtAuthGuard)
  submitCode(
    @Body() createSubmissionDto: CreateSubmissionDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<SubmitResult> {
    return this.submissionsService.submitCode(createSubmissionDto, user.sub);
  }

  /**
   * GET /api/submissions?card_id=&user_id=
   * Lấy lịch sử submission (dùng user_id từ query nếu không có auth)
   */
  @Get()
  findAll(
    @Query('card_id') cardId?: string,
    @Query('user_id') userId?: string,
  ): Promise<Submission[]> {
    if (cardId && userId) {
      return this.submissionsService.findByCardAndUser(cardId, userId);
    }
    return this.submissionsService.findAll();
  }

  @Post()
  create(
    @Body() createSubmissionDto: CreateSubmissionDto,
  ): Promise<Submission> {
    return this.submissionsService.create(createSubmissionDto);
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
