import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  collection: 'submissions',
  timestamps: { createdAt: 'submitted_at', updatedAt: false },
})
export class Submission extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Card', required: true })
  card_id!: Types.ObjectId;

  @Prop({ required: true })
  submitted_code!: string;

  @Prop({ required: true })
  language!: string;

  @Prop()
  status!: string;

  @Prop()
  execution_time!: number;

  @Prop()
  memory_used!: number;

  @Prop()
  error_details!: string;

  @Prop()
  hints_used_this_session!: number;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
