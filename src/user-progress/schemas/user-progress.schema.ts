import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'user_progress' })
export class UserProgress extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Card', required: true })
  card_id!: Types.ObjectId;

  @Prop()
  learning_mode!: string;

  @Prop()
  deadline_date!: Date;

  @Prop({ default: 0 })
  total_wrong_submissions!: number;

  @Prop({ default: 0 })
  total_hints_used!: number;

  @Prop()
  state!: string;

  @Prop()
  difficulty!: number;

  @Prop()
  stability!: number;

  @Prop({ default: 0 })
  reps!: number;

  @Prop({ default: 0 })
  lapses!: number;

  @Prop()
  scheduled_days!: number;

  @Prop()
  last_reviewed_at!: Date;

  @Prop()
  next_review_date!: Date;

  @Prop()
  last_rating!: string;
}

export const UserProgressSchema = SchemaFactory.createForClass(UserProgress);
