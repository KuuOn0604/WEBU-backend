import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { DifficultyLevel } from '../common/enums/difficulty-level.enum';
import { TestCase } from '../test-cases/schemas/test-cases.schema';
import { CreateCardDto } from './dto/create-card.dto';
import { GetCardsFilterDto } from './dto/get-cards-filter.dto';
import { Card } from './schemas/cards.schema';

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Card.name) private cardModel: Model<Card>,
    @InjectModel(TestCase.name) private testCaseModel: Model<TestCase>,
  ) {}

  async findAll(
    filterDto: GetCardsFilterDto,
    userId?: string,
  ): Promise<{
    data: Card[];
    meta: {
      total_items: number;
      current_page: number;
      total_pages: number;
    };
  }> {
    const {
      page = 1,
      limit = 10,
      tags,
      difficulty_level,
      search,
      group,
    } = filterDto;
    const query: Record<string, unknown> = {};

    if (userId) {
      query.$or = [
        { created_by: { $exists: false } },
        { created_by: null },
        { created_by: new Types.ObjectId(userId) },
      ];
    } else {
      query.$or = [{ created_by: { $exists: false } }, { created_by: null }];
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }
    if (difficulty_level) {
      query.difficulty_level =
        difficulty_level.toLowerCase() as DifficultyLevel;
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (group) {
      query.group = group;
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

  async create(createCardDto: CreateCardDto, userId: string): Promise<Card> {
    const card = new this.cardModel({
      title: createCardDto.title,
      difficulty_level: createCardDto.difficulty_level
        ? (createCardDto.difficulty_level.toLowerCase() as DifficultyLevel)
        : DifficultyLevel.MEDIUM,
      tags: createCardDto.tags,
      course: createCardDto.course,
      content: {
        question_text: createCardDto.description,
        description: createCardDto.description,
      },
      ide_data: {
        boilerplate_code: createCardDto.boilerplate_code,
      },
      created_by: new Types.ObjectId(userId),
    });
    const savedCard = await card.save();

    if (createCardDto.testcases && createCardDto.testcases.length > 0) {
      const testCaseDocs = createCardDto.testcases.map((tc, index) => ({
        card_id: savedCard._id,
        input: tc.input,
        expected_output: tc.expected_output,
        is_hidden: tc.is_hidden,
        order: index + 1,
      }));
      await this.testCaseModel.insertMany(testCaseDocs);
    }

    return savedCard;
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

    const cardId = (card as { _id: Types.ObjectId })._id;
    const public_test_cases = await this.testCaseModel
      .find({ card_id: cardId, is_hidden: false })
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
