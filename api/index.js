const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());

// Tell Express to serve our Frontend UI from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper function to validate URLs
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
};

app.get('/targets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM targets ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database Error');
  }
});

app.post('/targets', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).send('URL is required');
  }
  
  // SECURITY: Reject bad URLs
  if (!isValidUrl(url)) {
    return res.status(400).send('Invalid URL format. Must include http:// or https://');
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO targets (url) VALUES ($1) RETURNING *',
      [url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});