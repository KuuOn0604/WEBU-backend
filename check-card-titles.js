const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const uri = env.match(/MONGODB_URI=(.+)/)?.[1]?.trim();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

async function test() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const ids = [
    '6a3cab82c6b57871c6f9472e',
    '6a47cd244e4164a3e21bfa2a',
    '6a47cd244e4164a3e21bfa2b'
  ];

  for (const id of ids) {
    const card = await db.collection('cards').findOne({ _id: new ObjectId(id) });
    console.log('ID:', id, 'Title:', card ? card.title : 'NOT FOUND');
  }

  await mongoose.disconnect();
}

test().catch(console.error);
