import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class QuizOption {
  @Prop({ required: true })
  text!: string;
}

@Schema({ _id: false })
class QuizQuestion {
  @Prop({ required: true })
  question!: string;

  @Prop({ type: [QuizOption], required: true })
  options!: QuizOption[];

  @Prop({ required: true })
  correct_index!: number;

  @Prop({ required: true })
  explanation!: string;
}

@Schema({
  collection: 'flashcard_quizzes',
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class FlashcardQuiz extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Card', required: true, unique: true })
  card_id!: Types.ObjectId;

  @Prop({ type: [QuizQuestion], required: true })
  questions!: QuizQuestion[];

  @Prop({ default: true })
  is_ai_generated!: boolean;
}

export const FlashcardQuizSchema = SchemaFactory.createForClass(FlashcardQuiz);
