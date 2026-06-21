const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkTargets() {
  console.log('Worker: Checking targets...');
  try {
    const { rows } = await pool.query('SELECT * FROM targets');
    
    for (const target of rows) {
      try {
        const response = await fetch(target.url);
        const status = response.ok ? 'UP' : 'DOWN';
        
        await pool.query(
          'UPDATE targets SET status = $1, last_checked = NOW() WHERE id = $2',
          [status, target.id]
        );
        console.log(`[${status}] ${target.url}`);
      } catch (error) {
        await pool.query(
          'UPDATE targets SET status = $1, last_checked = NOW() WHERE id = $2',
          ['ERROR', target.id]
        );
        console.log(`[ERROR] ${target.url}`);
      }
    }
  } catch (error) {
    console.error('Database connection failed', error);
  }
}

// Run the check every 10 seconds
setInterval(checkTargets, 10000);
console.log('Background Worker Started.');