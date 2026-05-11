import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Schema } from 'mongoose';

import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { Card, CardSchema } from './schemas/cards.schema';

// temp fix
const DummyTestCaseSchema = new Schema({}, { strict: false });
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Card.name, schema: CardSchema },
      { name: 'TestCase', schema: DummyTestCaseSchema },
    ]),
  ],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
