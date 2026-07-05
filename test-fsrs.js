const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const uri = env.match(/MONGODB_URI=(.+)/)?.[1]?.trim();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

async function test() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const { fsrs, createEmptyCard, Rating } = await import('ts-fsrs');
  const fsrsAlgorithm = fsrs({});
  const now = new Date();

  // Let's simulate for userId: 6a3775302507b8b3c9ab8609, cardId: 6a47cd244e4164a3e21bfa2b (Contains Duplicate)
  const userId = '6a3775302507b8b3c9ab8609';
  const cardId = '6a47cd244e4164a3e21bfa2b';
  const isPassed = true;
  const difficultyLevel = 'Easy'; // Contains Duplicate is Easy? Let's check card.difficulty_level in DB

  const card = await db.collection('cards').findOne({ _id: new ObjectId(cardId) });
  console.log('Card in DB:', card);

  let progress = await db.collection('user_progress').findOne({
    user_id: new ObjectId(userId),
    card_id: new ObjectId(cardId),
  });
  console.log('Existing progress:', progress);

  const currentFsrsCard = progress
    ? {
        due: progress.next_review_date || now,
        state: progress.state,
        difficulty: progress.difficulty || 0,
        stability: progress.stability || 0,
        reps: progress.reps,
        lapses: progress.lapses,
        last_review: progress.last_reviewed_at,
        scheduled_days: progress.scheduled_days || 0,
        elapsed_days: 0,
        learning_steps: 0,
      }
    : createEmptyCard();

  let rating = Rating.Again;
  if (isPassed) {
    if (difficultyLevel === 'Easy') {
      rating = Rating.Easy;
    } else if (difficultyLevel === 'Medium') {
      rating = Rating.Good;
    } else {
      rating = Rating.Hard;
    }
  }

  console.log('Current FSRS Card before repeat:', currentFsrsCard);
  console.log('Rating chosen:', rating);

  const schedulingCards = fsrsAlgorithm.repeat(currentFsrsCard, now);
  const nextStateInfo = schedulingCards[rating].card;
  console.log('Next State Info:', nextStateInfo);

  await mongoose.disconnect();
}

test().catch(console.error);
