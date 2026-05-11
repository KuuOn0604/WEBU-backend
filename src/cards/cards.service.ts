import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';

import { GetCardsFilterDto } from './dto/get-cards-filter.dto';
import { Card } from './schemas/cards.schema';

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Card.name) private cardModel: Model<Card>,
    @InjectModel('TestCase') private testCaseModel: Model<any>,
  ) {}

  async findAll(filterDto: GetCardsFilterDto) {
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

  async findOne(id: string) {
    const card = await this.cardModel.findById(id).exec();
    if (!card) {
      throw new NotFoundException('Không tìm thấy bài tập này');
    }

    const public_test_cases = await this.testCaseModel
      .find({ card_id: id, is_hidden: false })
      .sort({ order: 1 })
      .select('-_id input expected_output order')
      .exec();

    return {
      ...card.toJSON(),
      public_test_cases,
    };
  }
}
