const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 5000;

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  next();
});

// Root test
app.get('/', (req, res) => {
  res.send('Backend root working');
});

// HYBRID API (External data + internal genre logic)
app.get('/api/quote', async (req, res) => {
  const genre = req.query.genre || 'life';

  try {
    const response = await axios.get(
      'https://api.api-ninjas.com/v1/quotes',
      {
        headers: {
          'X-Api-Key': 'qAsDsOT0aWySDDO8B0kdbA==sTxSHzOzmKQEeepg'
        }
      }
    );

    res.json({
      quote: response.data[0].quote,
      author: response.data[0].author,
      genre: genre
    });
  } catch (error) {
    res.json({
      quote: 'Keep going. Everything you need will come to you at the perfect time.',
      author: 'Unknown',
      genre: genre
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
