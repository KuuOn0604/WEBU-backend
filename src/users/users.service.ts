import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Submission } from '../submissions/schemas/submissions.schema';
import { UserProgressService } from '../user-progress/user-progress.service';
import { CreateUserDto } from './dto/create-user.dto';
import { OnboardingSetupDto } from './dto/onboarding-setup.dto';
import { OnboardingSurvey, User } from './schemas/users.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<Submission>,
    private readonly userProgressService: UserProgressService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async linkGoogleId(
    userId: string,
    googleId: string,
    avatar?: string,
  ): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { googleId, ...(avatar ? { avatar } : {}) },
        { new: true },
      )
      .exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
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
    return await this.userProgressService.getDailyTasks(userId);
  }

  async reviewCard(
    userId: string,
    cardId: string,
    rating: string,
  ): Promise<void> {
    return await this.userProgressService.reviewCard(userId, cardId, rating);
  }

  async getStats(userId: string): Promise<{
    total_cards_mastered: number;
    average_retention_rate: number;
    submission_history: {
      date: string;
      count: number;
    }[];
  }> {
    const { total_cards_mastered, average_retention_rate } =
      await this.userProgressService.getProgressStats(userId);

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
