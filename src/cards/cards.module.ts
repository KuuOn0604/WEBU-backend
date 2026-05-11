import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { Card, CardSchema } from './schemas/cards.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Card.name, schema: CardSchema }]),
  ],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
