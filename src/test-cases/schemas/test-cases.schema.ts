import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'test_cases' })
export class TestCase extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Card', required: true })
  card_id!: Types.ObjectId;

  @Prop({ required: true })
  input!: string;

  @Prop({ required: true })
  expected_output!: string;

  @Prop({ default: false })
  is_hidden!: boolean;

  @Prop({ required: true })
  order!: number;
}

export const TestCaseSchema = SchemaFactory.createForClass(TestCase);
