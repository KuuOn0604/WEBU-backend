import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TestCasesModule } from '../test-cases/test-cases.module';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { Card, CardSchema } from './schemas/cards.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Card.name, schema: CardSchema }]),
    TestCasesModule,
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService, MongooseModule],
})
export class CardsModule {}
