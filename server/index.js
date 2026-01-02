const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// ✅ FIX 1: Use cloud-assigned PORT
const PORT = process.env.PORT || 5000;

// ✅ FIX 2: Proper CORS
app.use(cors());

// Root test
app.get('/', (req, res) => {
  res.send('Backend root working');
});

// Quotes API
app.get('/api/quote', async (req, res) => {
  const genre = req.query.genre || 'life';

  try {
    const response = await axios.get(
      'https://api.api-ninjas.com/v1/quotes',
      {
        headers: {
          // ✅ FIX 3: Environment variable
          'X-Api-Key': process.env.API_NINJAS_KEY
        }
      }
    );

    res.json({
      quote: response.data[0].quote,
      author: response.data[0].author,
      genre
    });
  } catch (error) {
    res.json({
      quote: 'Keep going. Everything you need will come to you at the perfect time.',
      author: 'Unknown',
      genre
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
