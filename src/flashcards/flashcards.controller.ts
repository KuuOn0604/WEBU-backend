import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FlashcardsService } from './flashcards.service';
import { FlashcardQuiz } from './schemas/flashcard-quiz.schema';

@ApiTags('Flashcards')
@Controller('flashcards')
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  /**
   * GET /api/flashcards/:cardId/quiz
   * Lấy quiz cho bài tập — tự sinh bằng AI nếu chưa có (cache-aside)
   */
  @Get(':cardId/quiz')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get or AI-generate flashcard quiz for a problem (cached)',
  })
  getOrGenerateQuiz(@Param('cardId') cardId: string): Promise<FlashcardQuiz> {
    return this.flashcardsService.getOrGenerateQuiz(cardId);
  }

  /**
   * DELETE /api/flashcards/:cardId/quiz
   * Xóa cache quiz để regenerate
   */
  @Delete(':cardId/quiz')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate (delete) cached quiz for a problem' })
  async invalidateQuiz(
    @Param('cardId') cardId: string,
  ): Promise<{ message: string }> {
    await this.flashcardsService.invalidateQuiz(cardId);
    return { message: 'Quiz cache cleared. Next request will regenerate.' };
  }
}
