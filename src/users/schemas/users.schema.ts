import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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

  @Prop({ default: 'USER' })
  role!: string;

  @Prop({ type: Object })
  onboarding_survey!: Record<string, any>;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Card' }] })
  bookmarked!: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
