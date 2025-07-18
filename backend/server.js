const express = require('express');
const cors = require('cors');

// Dynamic import for node-fetch
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 5000;

// Your Pokémon TCG API key
const API_KEY = '974acf5c-7b12-47bf-929a-5be448ef2092';

const fetchOptions = {
  headers: {
    'X-Api-Key': API_KEY,
  },
};

app.use(cors());

// Route: Get all sets
app.get('/api/sets', async (req, res) => {
  try {
    const response = await fetch('https://api.pokemontcg.io/v2/sets', fetchOptions);
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    const json = await response.json();
    res.json(json.data);
  } catch (error) {
    console.error('Failed to fetch sets:', error);
    res.status(500).json({ error: 'Failed to fetch sets' });
  }
});

// Route: Get cards for a specific set
app.get('/api/cards', async (req, res) => {
  const { setId } = req.query;

  if (!setId) {
    return res.status(400).json({ error: 'Missing setId query parameter' });
  }

  try {
    const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${setId}`, fetchOptions);
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    const json = await response.json();
    res.json(json.data);
  } catch (error) {
    console.error(`Failed to fetch cards for set ${setId}:`, error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});
