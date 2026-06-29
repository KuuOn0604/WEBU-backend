import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';

import { TestCase } from '../test-cases/schemas/test-cases.schema';
import { GetCardsFilterDto } from './dto/get-cards-filter.dto';
import { Card } from './schemas/cards.schema';

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Card.name) private cardModel: Model<Card>,
    @InjectModel(TestCase.name) private testCaseModel: Model<TestCase>,
  ) {}

  async findAll(filterDto: GetCardsFilterDto): Promise<{
    data: Card[];
    meta: {
      total_items: number;
      current_page: number;
      total_pages: number;
    };
  }> {
    const { page = 1, limit = 10, tags, difficulty_level } = filterDto;
    const query: QueryFilter<Card> = {};

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }
    if (difficulty_level) {
      query.difficulty_level = difficulty_level;
    }

    const skip = (page - 1) * limit;

    const [data, total_items] = await Promise.all([
      this.cardModel.find(query).skip(skip).limit(limit).exec(),
      this.cardModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      meta: {
        total_items,
        current_page: page,
        total_pages: Math.ceil(total_items / limit),
      },
    };
  }

  async findOne(id: string): Promise<unknown> {
    let card: Card | null = null;
    if (Types.ObjectId.isValid(id)) {
      card = await this.cardModel.findById(id).exec();
    } else {
      const titleQuery = id.split('-').join(' ');
      const escapedTitle = titleQuery.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
      card = await this.cardModel
        .findOne({ title: { $regex: new RegExp(`^${escapedTitle}$`, 'i') } })
        .exec();
    }

    if (!card) {
      throw new NotFoundException('Không tìm thấy bài tập này');
    }

    const cardId = card._id;
    const public_test_cases = await this.testCaseModel
      .find({ card_idrd_id: cardId, is_hidden: false })
      .sort({ order: 1 })
      .select('-_id input expected_output order')
      .exec();

    const cardJson = card.toJSON() as Record<string, unknown>;
    return {
      ...cardJson,
      public_test_cases,
    };
  }
}
