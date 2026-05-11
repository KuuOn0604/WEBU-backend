import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Role } from '../../common/enums/role.enum';

// SCHEMA PHỤ
@Schema({ _id: false })
class OnboardingSurvey {
  @Prop()
  level!: string;

  @Prop()
  goals!: string[];
  // còn nữa
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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Card' }] })
  bookmarked!: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
