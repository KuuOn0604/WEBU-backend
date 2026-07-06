import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Card } from '../cards/schemas/cards.schema';
import { Submission } from '../submissions/schemas/submissions.schema';
import {
  FsrsProgressItem,
  UserProgressService,
} from '../user-progress/user-progress.service';
import { CreateUserDto } from './dto/create-user.dto';
import { OnboardingSetupDto } from './dto/onboarding-setup.dto';
import { OnboardingSurvey, User } from './schemas/users.schema';

export interface SkillStat {
  tag: string;
  total_attempts: number;
  passed_count: number;
  pass_rate: number; // 0–100
  skill_score: number; // weighted by retention, 0–100
}

export interface DailyActivity {
  date: string;
  passed: number;
  failed: number;
  total: number;
}

export interface ExtendedStats {
  total_cards_mastered: number;
  average_retention_rate: number;
  total_submissions: number;
  total_passed: number;
  current_streak: number;
  longest_streak: number;
  solved_by_difficulty: { Easy: number; Medium: number; Hard: number };
  submission_history: { date: string; count: number }[];
  daily_activity: DailyActivity[];
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<Submission>,
    @InjectModel(Card.name)
    private readonly cardModel: Model<Card>,
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

  async getStats(userId: string): Promise<ExtendedStats> {
    const { total_cards_mastered, average_retention_rate } =
      await this.userProgressService.getProgressStats(userId);

    const userObjId = new Types.ObjectId(userId);
    // Support both ObjectId and legacy string user_id in submissions
    const userIdFilter = { $in: [userObjId, userId] };

    // Tổng submissions + passed
    const [total_submissions, total_passed] = await Promise.all([
      this.submissionModel.countDocuments({ user_id: userIdFilter }).exec(),
      this.submissionModel
        .countDocuments({ user_id: userIdFilter, passed: true })
        .exec(),
    ]);

    // Submission history (heatmap) — toàn bộ lịch sử
    const submission_history = await this.submissionModel
      .aggregate<{ date: string; count: number }>([
        { $match: { user_id: userIdFilter } },
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

    // Daily activity (30 ngày gần nhất) — passed vs failed
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRaw = await this.submissionModel
      .aggregate<{
        date: string;
        passed: number;
        failed: number;
        total: number;
      }>([
        {
          $match: {
            user_id: userIdFilter,
            submitted_at: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$submitted_at' },
            },
            passed: { $sum: { $cond: ['$passed', 1, 0] } },
            failed: { $sum: { $cond: ['$passed', 0, 1] } },
          },
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            passed: 1,
            failed: 1,
            total: { $add: ['$passed', '$failed'] },
          },
        },
        { $sort: { date: 1 } },
      ])
      .exec();

    // Streak calculation
    const { current_streak, longest_streak } = this.calculateStreaks(
      submission_history.map((s) => s.date),
    );

    // Solved by difficulty — join submissions với cards
    const solvedByDifficulty = await this.submissionModel
      .aggregate<{ _id: string; count: number }>([
        { $match: { user_id: userIdFilter, passed: true } },
        {
          $group: {
            _id: '$card_id',
          },
        },
        {
          // Convert card_id to ObjectId if it's stored as string
          $addFields: {
            card_id_obj: {
              $cond: {
                if: { $eq: [{ $type: '$_id' }, 'string'] },
                then: {
                  $convert: { input: '$_id', to: 'objectId', onError: null },
                },
                else: '$_id',
              },
            },
          },
        },
        {
          $lookup: {
            from: 'cards',
            localField: 'card_id_obj',
            foreignField: '_id',
            as: 'card',
          },
        },
        { $unwind: '$card' },
        {
          $group: {
            _id: '$card.difficulty_level',
            count: { $sum: 1 },
          },
        },
      ])
      .exec();

    const solved_by_difficulty = { Easy: 0, Medium: 0, Hard: 0 };
    solvedByDifficulty.forEach((d) => {
      if (d._id in solved_by_difficulty) {
        solved_by_difficulty[d._id as keyof typeof solved_by_difficulty] =
          d.count;
      }
    });

    return {
      total_cards_mastered,
      average_retention_rate,
      total_submissions,
      total_passed,
      current_streak,
      longest_streak,
      solved_by_difficulty,
      submission_history,
      daily_activity: dailyRaw,
    };
  }

  /**
   * Thống kê kỹ năng theo tag (cho Skill Radar Chart)
   * join submissions → cards.tags → user_progress retention
   */
  async getSkillStats(userId: string): Promise<SkillStat[]> {
    const userObjId = new Types.ObjectId(userId);
    // Support both ObjectId and legacy string user_id in submissions
    const userIdFilter = { $in: [userObjId, userId] };

    // Lấy tất cả submissions của user, kèm card info
    const submissionsWithCards = await this.submissionModel
      .aggregate<{
        card_id: Types.ObjectId;
        passed: boolean;
        tags: string[];
      }>([
        { $match: { user_id: userIdFilter } },
        {
          // Convert card_id to ObjectId if stored as string
          $addFields: {
            card_id_obj: {
              $cond: {
                if: { $eq: [{ $type: '$card_id' }, 'string'] },
                then: {
                  $convert: {
                    input: '$card_id',
                    to: 'objectId',
                    onError: null,
                  },
                },
                else: '$card_id',
              },
            },
          },
        },
        {
          $lookup: {
            from: 'cards',
            localField: 'card_id_obj',
            foreignField: '_id',
            as: 'card',
          },
        },
        { $unwind: { path: '$card', preserveNullAndEmptyArrays: false } },
        {
          $project: {
            card_id: '$card_id',
            passed: 1,
            tags: '$card.tags',
          },
        },
      ])
      .exec();

    // Lấy retention per card từ user_progress
    const progressList =
      await this.userProgressService.getFsrsProgressList(userId);
    const retentionMap = new Map<string, number>();
    progressList.forEach((p) => {
      const retention = p.reps > 0 ? Math.max(0, 1 - p.lapses / p.reps) : 1;
      retentionMap.set(p.card_id, retention);
    });

    // Gom theo tag
    const tagStats = new Map<
      string,
      {
        total: number;
        passed: number;
        retentionSum: number;
        retentionCount: number;
      }
    >();

    for (const sub of submissionsWithCards) {
      const retention = retentionMap.get(sub.card_id.toString()) ?? 1;
      for (const tag of sub.tags ?? []) {
        if (!tagStats.has(tag)) {
          tagStats.set(tag, {
            total: 0,
            passed: 0,
            retentionSum: 0,
            retentionCount: 0,
          });
        }
        const s = tagStats.get(tag)!;
        s.total += 1;
        if (sub.passed) s.passed += 1;
        s.retentionSum += retention;
        s.retentionCount += 1;
      }
    }

    const result: SkillStat[] = [];
    tagStats.forEach((s, tag) => {
      const pass_rate = s.total > 0 ? (s.passed / s.total) * 100 : 0;
      const avg_retention =
        s.retentionCount > 0 ? s.retentionSum / s.retentionCount : 1;
      const skill_score = Math.round(pass_rate * avg_retention);
      result.push({
        tag,
        total_attempts: s.total,
        passed_count: s.passed,
        pass_rate: Math.round(pass_rate),
        skill_score,
      });
    });

    return result.sort((a, b) => b.skill_score - a.skill_score);
  }

  /**
   * Lấy FSRS progress list (cho FSRS data table)
   */
  async getFsrsProgress(userId: string): Promise<FsrsProgressItem[]> {
    return this.userProgressService.getFsrsProgressList(userId);
  }

  /**
   * Lấy danh sách ID các bài tập người dùng đã làm (đã submit)
   */
  async getInteractedCards(userId: string): Promise<string[]> {
    const userObjId = new Types.ObjectId(userId);
    const userIdFilter = { $in: [userObjId, userId] };
    const submissions = await this.submissionModel
      .find({ user_id: userIdFilter })
      .select('card_id')
      .exec();
    const ids = new Set(submissions.map((s) => s.card_id.toString()));
    return Array.from(ids);
  }

  /** Tính streak từ mảng ngày có submission */
  private calculateStreaks(dates: string[]): {
    current_streak: number;
    longest_streak: number;
  } {
    if (dates.length === 0) return { current_streak: 0, longest_streak: 0 };

    const uniqueDates = [...new Set(dates)].sort();
    let longest = 1;
    let current = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]);
      const curr = new Date(uniqueDates[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        current += 1;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }

    // Check if streak is active today or yesterday
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);
    const lastDate = uniqueDates[uniqueDates.length - 1];
    const activeStreak =
      lastDate === today || lastDate === yesterday ? current : 0;

    return { current_streak: activeStreak, longest_streak: longest };
  }
}
