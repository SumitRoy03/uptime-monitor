const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function pingWithRetries(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(5000) });
      if (response.ok) return true; // It's UP!
    } catch (error) {
      console.log(`[Attempt ${attempt}/${maxRetries}] Failed to reach ${url}`);
    }
    if (attempt < maxRetries) await new Promise(res => setTimeout(res, 2000));
  }
  return false;
}

async function checkTargets() {
  console.log('Worker: Checking targets...');
  try {
    const { rows } = await pool.query('SELECT * FROM targets');
    
    for (const target of rows) {
      const isUp = await pingWithRetries(target.url);
      const status = isUp ? 'UP' : 'DOWN';
      
      await pool.query(
        'UPDATE targets SET status = $1, last_checked = NOW() WHERE id = $2',
        [status, target.id]
      );
      
      console.log(`[${status}] ${target.url} (Database updated)`);
    }
  } catch (err) {
    console.error('Worker Database Error:', err.message);
  }
}

// Run the loop every 15 seconds
setInterval(checkTargets, 15000);
checkTargets(); // Run immediately on startup