import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import {
  CARD_COURSES,
  CARD_DIFFICULTIES,
  CARD_TAGS,
} from '../common/constants/card-config';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { GetCardsFilterDto } from './dto/get-cards-filter.dto';
import { Card } from './schemas/cards.schema';

@Controller('cards')
export class CardsController {
  constructor(
    private readonly cardsService: CardsService,
    private readonly jwtService: JwtService,
  ) {}

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
  async findAll(
    @Query() filterDto: GetCardsFilterDto,
    @Headers('authorization') authHeader?: string,
  ): Promise<{
    data: Card[];
    meta: {
      total_items: number;
      current_page: number;
      total_pages: number;
    };
  }> {
    let userId: string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
        userId = payload.sub;
      } catch {
        // Token invalid or expired, ignore and treat as guest
      }
    }
    return this.cardsService.findAll(filterDto, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createCardDto: CreateCardDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Card> {
    return this.cardsService.create(createCardDto, user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<unknown> {
    return this.cardsService.findOne(id);
  }
}
