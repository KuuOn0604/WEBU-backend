import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AiService } from '../ai/ai.service';
import { Card } from '../cards/schemas/cards.schema';
import { FlashcardQuiz } from './schemas/flashcard-quiz.schema';

@Injectable()
export class FlashcardsService {
  constructor(
    @InjectModel(FlashcardQuiz.name)
    private readonly quizModel: Model<FlashcardQuiz>,
    @InjectModel(Card.name)
    private readonly cardModel: Model<Card>,
    private readonly aiService: AiService,
  ) {}

  /**
   * Lấy quiz cho một card — tự sinh bằng AI nếu chưa có trong DB (cache-aside)
   */
  async getOrGenerateQuiz(cardId: string): Promise<FlashcardQuiz> {
    const existing = await this.quizModel
      .findOne({ card_id: new Types.ObjectId(cardId) })
      .exec();
    if (existing) return existing;

    const card = await this.cardModel.findById(cardId).exec();
    if (!card) {
      throw new NotFoundException(`Không tìm thấy bài tập với ID: ${cardId}`);
    }

    const rawQuestions = await this.aiService.generateFlashcardQuiz(
      card.title,
      card.content?.description ?? '',
      card.tags ?? [],
    );

    const quiz = new this.quizModel({
      card_id: new Types.ObjectId(cardId),
      questions: rawQuestions.map((q) => ({
        question: q.question,
        options: q.options.map((text) => ({ text })),
        correct_index: q.correct_index,
        explanation: q.explanation,
      })),
      is_ai_generated: true,
    });

    return quiz.save();
  }

  /**
   * Xóa cache quiz của một card (để regenerate)
   */
  async invalidateQuiz(cardId: string): Promise<void> {
    await this.quizModel
      .deleteOne({ card_id: new Types.ObjectId(cardId) })
      .exec();
  }
}
