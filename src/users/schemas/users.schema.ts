import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { LearningMode } from '../../common/enums/learning-mode.enum';
import { Role } from '../../common/enums/role.enum';

// SCHEMA PHỤ
@Schema({ _id: false })
export class OnboardingSurvey {
  @Prop()
  level!: string;

  @Prop()
  goals!: string[];
}
// SCHEMA CHÍNH
@Schema({
  collection: 'users',
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class User extends Document {
  @Prop({ required: true })
  username!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password_hash!: string;

  @Prop({ type: String, enum: Role, default: Role.USER })
  role!: Role;

  @Prop({ type: OnboardingSurvey })
  onboarding_survey!: OnboardingSurvey;

  @Prop({ type: String, enum: LearningMode })
  learning_mode?: LearningMode;

  @Prop()
  deadline_date?: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Card' }] })
  bookmarked!: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
