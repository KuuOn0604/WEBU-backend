import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Note extends Document {
  @Prop({ required: true, index: true })
  user_id!: string;

  @Prop({ required: true, index: true })
  card_id!: string;

  @Prop({ default: '' })
  content!: string;
}

export const NoteSchema = SchemaFactory.createForClass(Note);

NoteSchema.index({ user_id: 1, card_id: 1 }, { unique: true });
