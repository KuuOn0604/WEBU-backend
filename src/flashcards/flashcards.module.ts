import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { CardsModule } from '../cards/cards.module';
import { FlashcardsController } from './flashcards.controller';
import { FlashcardsService } from './flashcards.service';
import {
  FlashcardQuiz,
  FlashcardQuizSchema,
} from './schemas/flashcard-quiz.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FlashcardQuiz.name, schema: FlashcardQuizSchema },
    ]),
    AiModule,
    CardsModule,
    AuthModule,
  ],
  controllers: [FlashcardsController],
  providers: [FlashcardsService],
  exports: [FlashcardsService],
})
export class FlashcardsModule {}
