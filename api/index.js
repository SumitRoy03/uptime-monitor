const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Connects using the environment variable injected by Docker Compose
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Endpoint to view all monitored sites
app.get('/targets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM targets ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database Error');
  }
});

// Endpoint to add a new URL to monitor dynamically
app.post('/targets', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).send('URL is required in the JSON body');
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