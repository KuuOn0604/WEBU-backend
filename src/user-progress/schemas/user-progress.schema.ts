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

  @Prop({ type: Number, enum: [0, 1, 2, 3], default: 0 })
  state!: State;

  @Prop({ type: Number })
  difficulty?: number;

  @Prop({ type: Number })
  stability?: number;

  @Prop({ type: Number, default: 0 })
  reps!: number;

  @Prop({ type: Number, default: 0 })
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
