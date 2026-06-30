import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { UserProgress } from '../user-progress/schemas/user-progress.schema';
import { FsrsService } from './fsrs.service';

@Controller('api/fsrs')
export class FsrsController {
  constructor(private readonly fsrsService: FsrsService) {}

  @Get('due-reviews')
  async getDueReviews(
    @Query('userId') userId: string,
  ): Promise<UserProgress[]> {
    return this.fsrsService.getDueReviews(userId);
  }

  @Post('review')
  async submitReview(
    @Body('userId') userId: string,
    @Body('cardId') cardId: string,
    @Body('isPassed') isPassed: boolean,
    @Body('problemDifficulty') problemDifficulty: string,
  ): Promise<UserProgress> {
    return this.fsrsService.updateProgress(
      userId,
      cardId,
      isPassed,
      problemDifficulty,
    );
  }
}
