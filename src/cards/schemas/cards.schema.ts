import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { DifficultyLevel } from '../../common/enums/difficulty-level.enum';

// SCHEMA PHỤ
@Schema({ _id: false })
class Content {
  @Prop({ required: true })
  question_text!: string;

  @Prop({ required: true })
  description!: string;
}
@Schema({ _id: false })
class BoilerplateCode {
  @Prop()
  java?: string;

  @Prop()
  python?: string;

  @Prop()
  cpp?: string;

  @Prop()
  typescript?: string;
}
@Schema({ _id: false })
class IdeData {
  @Prop({ type: BoilerplateCode, required: true })
  boilerplate_code!: BoilerplateCode;
  // theme, fontSize, defaultLanguage...
}
@Schema({ _id: false })
class FollowUpMcq {
  @Prop({ required: true })
  question!: string;

  @Prop({ type: [String], required: true })
  options!: string[];

  @Prop({ required: true })
  correct_index!: number;
}
// SCHEMA CHÍNH
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

  @Prop({ type: Content })
  content!: Content;

  @Prop({ type: IdeData })
  ide_data!: IdeData;

  @Prop()
  ai_hint_content!: string;

  @Prop({ type: FollowUpMcq })
  follow_up_mcq!: FollowUpMcq;

  @Prop({
    type: String,
    enum: DifficultyLevel,
    default: DifficultyLevel.MEDIUM,
  })
  difficulty_level!: DifficultyLevel;
}

export const CardSchema = SchemaFactory.createForClass(Card);
