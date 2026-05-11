import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  collection: 'cards',
  timestamps: { createdAt: false, updatedAt: 'updated_at' },
})
export class Card extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop()
  group!: string;

  @Prop([String])
  tags!: string[];

  @Prop({ type: Object })
  content!: Record<string, any>;

  @Prop({ type: Object })
  ide_data!: Record<string, any>;

  @Prop()
  ai_hint_content!: string;

  @Prop({ type: Object })
  follow_up_mcq!: Record<string, any>;

  @Prop({ default: 'MEDIUM' })
  difficulty_level!: string;
}

export const CardSchema = SchemaFactory.createForClass(Card);
