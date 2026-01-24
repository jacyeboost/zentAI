
require('dotenv').config();
const { Pool } = require('pg');

async function fixNegatives() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL is missing in .env');
    return;
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected.');

    const sql = "UPDATE ventas SET cantidad = ABS(cantidad) WHERE cantidad < 0;";
    console.log(`🚀 Executing: ${sql}`);
    
    const res = await client.query(sql);
    console.log(`✅ Update complete. Rows affected: ${res.rowCount}`);
    
    client.release();
  } catch (err) {
    console.error('❌ Database Error:', err.message);
  } finally {
    await pool.end();
  }
}

fixNegatives();
