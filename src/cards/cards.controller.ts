import { Controller, Get, Param, Query } from '@nestjs/common';

import { CardsService } from './cards.service';
import { GetCardsFilterDto } from './dto/get-cards-filter.dto';
import { Card } from './schemas/cards.schema';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  findAll(@Query() filterDto: GetCardsFilterDto): Promise<{
    data: Card[];
    meta: {
      total_items: number;
      current_page: number;
      total_pages: number;
    };
  }> {
    return this.cardsService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<unknown> {
    return this.cardsService.findOne(id);
  }
}
