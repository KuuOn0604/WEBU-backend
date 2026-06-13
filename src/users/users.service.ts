import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Card } from '../cards/schemas/cards.schema';
import { LastRating } from '../common/enums/last-rating.enum';
import { State } from '../common/enums/state.enum';
import { Submission } from '../submissions/schemas/submissions.schema';
import { UserProgress } from '../user-progress/schemas/user-progress.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { OnboardingSetupDto } from './dto/onboarding-setup.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { OnboardingSurvey, User } from './schemas/users.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(UserProgress.name)
    private readonly userProgressModel: Model<UserProgress>,
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<Submission>,
    @InjectModel(Card.name) private readonly cardModel: Model<Card>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async updateSetup(
    userId: string,
    setupDto: OnboardingSetupDto,
  ): Promise<{
    status: string;
    message: string;
    updated_at: Date;
  }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng');
    }

    user.learning_mode = setupDto.learning_mode;
    user.onboarding_survey =
      setupDto.onboarding_survey as unknown as OnboardingSurvey;
    if (setupDto.deadline_date) {
      user.deadline_date = new Date(setupDto.deadline_date);
    } else {
      user.deadline_date = undefined;
    }

    await user.save();

    return {
      status: 'success',
      message: 'Cập nhật khảo sát và chế độ học thành công',
      updated_at: new Date(),
    };
  }

  async getDailyTasks(userId: string): Promise<
    {
      card_id: string;
      title: string;
      next_review_date: Date;
    }[]
  > {
    const now = new Date();

    // Tìm các task đến hạn ôn tập hoặc trạng thái mới
    let progressList = await this.userProgressModel
      .find({
        user_id: new Types.ObjectId(userId),
        $or: [{ next_review_date: { $lte: now } }, { state: State.NEW }],
      })
      .populate('card_id')
      .exec();

    // Nếu người dùng chưa có progress nào, lấy tối đa 5 thẻ mới để gán ôn tập
    if (progressList.length === 0) {
      const existingProgress = await this.userProgressModel
        .find({ user_id: new Types.ObjectId(userId) })
        .select('card_id')
        .exec();
      const existingCardIds = existingProgress.map((p) => p.card_id.toString());

      // Lấy các card chưa có progress
      const newCards = await this.cardModel
        .find({ _id: { $nin: existingCardIds } })
        .limit(5)
        .exec();

      const createdProgressList: UserProgress[] = [];
      for (const card of newCards) {
        const progress = new this.userProgressModel({
          user_id: new Types.ObjectId(userId),
          card_id: card._id,
          state: State.NEW,
          difficulty: 5,
          stability: 2,
          reps: 0,
          lapses: 0,
          next_review_date: now,
        });
        await progress.save();
        createdProgressList.push(progress);
      }

      if (createdProgressList.length > 0) {
        progressList = await this.userProgressModel
          .find({ _id: { $in: createdProgressList.map((p) => p._id) } })
          .populate('card_id')
          .exec();
      }
    }

    return progressList
      .filter((p) => p.card_id) // Lọc bỏ nếu card_id không tồn tại (do db mồ côi)
      .map((p) => {
        const card = p.card_id as unknown as Card;
        const cardId = card._id.toString();
        return {
          card_id: cardId,
          title: card.title,
          next_review_date: p.next_review_date,
        };
      });
  }

  async reviewCard(
    userId: string,
    cardId: string,
    rating: string,
  ): Promise<void> {
    const progress = await this.userProgressModel
      .findOne({
        user_id: new Types.ObjectId(userId),
        card_id: new Types.ObjectId(cardId),
      })
      .exec();

    if (!progress) {
      throw new NotFoundException(
        'Không tìm thấy tiến trình ôn tập cho bài tập này',
      );
    }

    const now = new Date();
    let scheduled_days = progress.scheduled_days || 1;
    let difficulty = progress.difficulty || 5;
    let stability = progress.stability || 2;
    let reps = progress.reps || 0;
    let lapses = progress.lapses || 0;

    // Chuyển rating thành enum
    let lastRatingEnum: LastRating = LastRating.GOOD;
    if (rating === 'easy') lastRatingEnum = LastRating.EASY;
    if (rating === 'hard') lastRatingEnum = LastRating.HARD;

    if (reps === 0) {
      reps = 1;
      if (rating === 'easy') {
        scheduled_days = 4;
        difficulty = 3;
        stability = 4;
      } else if (rating === 'good') {
        scheduled_days = 2;
        difficulty = 4;
        stability = 2;
      } else {
        scheduled_days = 1;
        difficulty = 5;
        stability = 1;
      }
    } else {
      reps += 1;
      if (rating === 'easy') {
        scheduled_days = Math.ceil(scheduled_days * 2.5);
        difficulty = Math.max(1, difficulty - 1);
        stability = Math.ceil(stability * 2.0);
      } else if (rating === 'good') {
        scheduled_days = Math.ceil(scheduled_days * 1.8);
        stability = Math.ceil(stability * 1.5);
      } else {
        scheduled_days = 1;
        difficulty = Math.min(10, difficulty + 1);
        stability = Math.max(1, Math.floor(stability * 0.5));
        lapses += 1;
      }
    }

    progress.reps = reps;
    progress.difficulty = difficulty;
    progress.stability = stability;
    progress.scheduled_days = scheduled_days;
    progress.lapses = lapses;
    progress.last_reviewed_at = now;
    progress.next_review_date = new Date(
      now.getTime() + scheduled_days * 24 * 3600 * 1000,
    );
    progress.last_rating = lastRatingEnum;
    progress.state = rating === 'hard' ? State.LEARNING : State.REVIEW;

    await progress.save();
    return;
  }

  async getStats(userId: string): Promise<{
    total_cards_mastered: number;
    average_retention_rate: number;
    submission_history: {
      date: string;
      count: number;
    }[];
  }> {
    const total_cards_mastered = await this.userProgressModel
      .countDocuments({
        user_id: new Types.ObjectId(userId),
        state: State.REVIEW,
      })
      .exec();

    const progressRecords = await this.userProgressModel
      .find({
        user_id: new Types.ObjectId(userId),
      })
      .exec();

    let total_reviews = 0;
    let total_lapses = 0;

    progressRecords.forEach((p) => {
      total_reviews += p.reps || 0;
      total_lapses += p.lapses || 0;
    });

    const average_retention_rate =
      total_reviews > 0
        ? Math.max(
            0,
            Math.min(
              100,
              Math.round((1 - total_lapses / total_reviews) * 1000) / 10,
            ),
          )
        : 100.0;

    const submission_history = await this.submissionModel
      .aggregate<{
        date: string;
        count: number;
      }>([
        { $match: { user_id: new Types.ObjectId(userId) } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$submitted_at' },
            },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, date: '$_id', count: 1 } },
        { $sort: { date: 1 } },
      ])
      .exec();

    return {
      total_cards_mastered,
      average_retention_rate,
      submission_history,
    };
  }
}
