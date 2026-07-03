import { Controller, Get, Param, Query } from '@nestjs/common';

import {
  CARD_COURSES,
  CARD_DIFFICULTIES,
  CARD_TAGS,
} from '../common/constants/card-config';
import { CardsService } from './cards.service';
import { GetCardsFilterDto } from './dto/get-cards-filter.dto';
import { Card } from './schemas/cards.schema';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('meta-options')
  getMetaOptions(): {
    tags: string[];
    courses: string[];
    difficulties: string[];
  } {
    return {
      tags: CARD_TAGS,
      courses: CARD_COURSES,
      difficulties: CARD_DIFFICULTIES,
    };
  }

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
