import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { Card } from 'ts-fsrs' with { 'resolution-mode': 'import' };

import { LastRating } from '../common/enums/last-rating.enum';
import { State } from '../common/enums/state.enum';
import { UserProgress } from '../user-progress/schemas/user-progress.schema';

@Injectable()
export class FsrsService {
  constructor(
    @InjectModel(UserProgress.name) private progressModel: Model<UserProgress>,
  ) {}

  async updateProgress(
    userId: string,
    cardId: string,
    isPassed: boolean,
    difficultyLevel: string,
  ): Promise<UserProgress> {
    const { fsrs, createEmptyCard, Rating } = await import('ts-fsrs');
    const fsrsAlgorithm = fsrs({});
    const now = new Date();

    let progress = await this.progressModel.findOne({
      user_id: new Types.ObjectId(userId),
      card_id: new Types.ObjectId(cardId),
    });

    const currentFsrsCard: Card = progress
      ? ({
          due: progress.next_review_date || now,
          state: progress.state as unknown,
          difficulty: progress.difficulty || 0,
          stability: progress.stability || 0,
          reps: progress.reps,
          lapses: progress.lapses,
          last_review: progress.last_reviewed_at,
          scheduled_days: progress.scheduled_days || 0,
          elapsed_days: 0,
          learning_steps: 0,
        } as Card)
      : createEmptyCard();

    let rating = Rating.Again;
    let lastRatingEnum = LastRating.AGAIN;

    if (isPassed) {
      if (difficultyLevel === 'Easy') {
        rating = Rating.Easy;
        lastRatingEnum = LastRating.EASY;
      } else if (difficultyLevel === 'Medium') {
        rating = Rating.Good;
        lastRatingEnum = LastRating.GOOD;
      } else {
        rating = Rating.Hard;
        lastRatingEnum = LastRating.HARD;
      }
    }

    const schedulingCards = fsrsAlgorithm.repeat(currentFsrsCard, now);
    const nextStateInfo = schedulingCards[rating].card;

    if (!progress) {
      progress = new this.progressModel({
        user_id: new Types.ObjectId(userId),
        card_id: new Types.ObjectId(cardId),
      });
    }

    progress.next_review_date = nextStateInfo.due;
    progress.last_reviewed_at = now;
    progress.state = nextStateInfo.state as unknown as State;
    progress.difficulty = nextStateInfo.difficulty;
    progress.stability = nextStateInfo.stability;
    progress.reps = nextStateInfo.reps;
    progress.lapses = nextStateInfo.lapses;
    progress.scheduled_days = nextStateInfo.scheduled_days;

    progress.last_rating = lastRatingEnum;
    if (!isPassed) {
      progress.total_wrong_submissions += 1;
    }

    await progress.save();
    return progress;
  }

  async getDueReviews(userId: string): Promise<UserProgress[]> {
    const now = new Date();
    return this.progressModel
      .find({
        user_id: new Types.ObjectId(userId),
        $or: [
          // Cards that have been reviewed and are now due
          {
            state: { $ne: State.NEW },
            next_review_date: { $lte: now },
          },
          // Cards in NEW state (never reviewed) always show up for review
          { state: State.NEW },
        ],
      })
      .sort({ next_review_date: 1 })
      .populate('card_id');
  }
}
