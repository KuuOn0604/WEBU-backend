const axios = require('axios');

async function testHttp() {
  try {
    const response = await axios.post('http://localhost:3000/api/fsrs/review', {
      userId: '6a3775302507b8b3c9ab8609',
      cardId: '6a47cd244e4164a3e21bfa2b',
      isPassed: true,
      problemDifficulty: 'Easy'
    });
    console.log('HTTP Status:', response.status);
    console.log('HTTP Body:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('HTTP Error Status:', error.response.status);
      console.error('HTTP Error Body:', error.response.data);
    } else {
      console.error('Network/Other Error:', error.message);
    }
  }
}

testHttp();
