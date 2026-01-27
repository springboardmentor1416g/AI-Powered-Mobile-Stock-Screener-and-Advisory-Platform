require('dotenv').config();
const db = require('./src/config/database');

async function test() {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('✓ Database connected:', result.rows[0].now);

    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log(`✓ Tables found: ${tables.rows.length}`);

    const companies = await db.query('SELECT COUNT(*) FROM companies');
    console.log(`✓ Companies: ${companies.rows[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

test();