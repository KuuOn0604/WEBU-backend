/**
 * Seed script: Tạo 1 card mẫu "Two Sum" với boilerplate code và test cases vào MongoDB
 * Chạy: node seed.js
 */

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI =
  'mongodb+srv://webudb:webudb@webubackend.mdcnh7i.mongodb.net/?appName=WEBUBackEnd';
const DB_NAME = 'test'; // MongoDB Atlas mặc định

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(DB_NAME);
    const cards = db.collection('cards');
    const testCases = db.collection('test_cases');

    // Kiểm tra xem đã có card "Two Sum" chưa
    const existing = await cards.findOne({ title: 'Two Sum' });
    if (existing) {
      console.log('⚠️  Card "Two Sum" đã tồn tại với ID:', existing._id.toString());
      console.log('Dùng ID này trong URL: /problems/' + existing._id.toString());

      // Kiểm tra test cases
      const tcCount = await testCases.countDocuments({ card_id: existing._id });
      console.log(`📝 Test cases: ${tcCount}`);
      if (tcCount === 0) {
        // Thêm test cases
        await seedTestCases(testCases, existing._id);
      }
      return;
    }

    // Tạo card mới
    const cardId = new ObjectId();
    await cards.insertOne({
      _id: cardId,
      title: 'Two Sum',
      group: 'Arrays & Hashing',
      tags: ['Array', 'Hash Table'],
      content: {
        question_text: 'Two Sum',
        description:
          'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
      },
      ide_data: {
        boilerplate_code: {
          javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your code here
  
}`,
          python: `class Solution:
    def twoSum(self, nums, target):
        # Write your code here
        pass`,
          cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
        return {};
    }
};`,
          java: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[] {};
    }
}`,
        },
      },
      difficulty_level: 'Easy',
      updated_at: new Date(),
    });

    console.log('✅ Card "Two Sum" created with ID:', cardId.toString());
    console.log('👉 URL: /problems/' + cardId.toString());

    // Tạo test cases
    await seedTestCases(testCases, cardId);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

async function seedTestCases(testCases, cardId) {
  const tc = [
    {
      card_id: cardId,
      input: '[2,7,11,15]\n9',
      expected_output: '[0,1]',
      is_hidden: false,
      order: 1,
    },
    {
      card_id: cardId,
      input: '[3,2,4]\n6',
      expected_output: '[1,2]',
      is_hidden: false,
      order: 2,
    },
    {
      card_id: cardId,
      input: '[3,3]\n6',
      expected_output: '[0,1]',
      is_hidden: false,
      order: 3,
    },
    // Hidden test cases
    {
      card_id: cardId,
      input: '[1,2,3,4,5]\n9',
      expected_output: '[3,4]',
      is_hidden: true,
      order: 4,
    },
    {
      card_id: cardId,
      input: '[-1,-2,-3,-4,-5]\n-8',
      expected_output: '[2,4]',
      is_hidden: true,
      order: 5,
    },
  ];

  await testCases.insertMany(tc);
  console.log('✅ Test cases created:', tc.length, 'total (3 public, 2 hidden)');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
