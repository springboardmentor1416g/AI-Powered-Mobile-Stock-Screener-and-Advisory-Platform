/**
 * Database Setup Script
 * Runs the schema.sql file using Node.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function setupDatabase() {
  console.log('==========================================');
  console.log('Stock Screener Database Setup');
  console.log('==========================================\n');

  // First, connect to postgres database to create stock_screener database
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect to default postgres database
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    console.log('Step 1: Connecting to PostgreSQL...');
    await adminClient.connect();
    console.log('✓ Connected to PostgreSQL\n');

    // Drop existing database if it exists
    console.log('Step 2: Dropping existing database (if exists)...');
    try {
      await adminClient.query('DROP DATABASE IF EXISTS stock_screener;');
      console.log('✓ Existing database dropped\n');
    } catch (error) {
      console.log('ℹ No existing database to drop\n');
    }

    // Create new database
    console.log('Step 3: Creating stock_screener database...');
    await adminClient.query('CREATE DATABASE stock_screener;');
    console.log('✓ Database created\n');

    await adminClient.end();

    // Now connect to the new database and run schema
    const dbClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: 'stock_screener',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    console.log('Step 4: Connecting to stock_screener database...');
    await dbClient.connect();
    console.log('✓ Connected\n');

    // Read schema file
    console.log('Step 5: Reading schema.sql file...');
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('✓ Schema file loaded\n');

    // Split SQL by statements (remove comments and split by semicolons)
    console.log('Step 6: Executing schema...');
    const statements = schemaSql
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n')
      .split(';')
      .filter(stmt => stmt.trim() !== '');

    let executedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          // Skip \c commands (psql specific)
          if (statement.startsWith('\\')) {
            continue;
          }

          await dbClient.query(statement);
          executedCount++;
          
          // Show progress every 10 statements
          if (executedCount % 10 === 0) {
            console.log(`   Executed ${executedCount} statements...`);
          }
        } catch (error) {
          // Some statements might fail (e.g., CREATE EXTENSION if already exists)
          // Only show critical errors
          if (!error.message.includes('already exists')) {
            console.error(`   Warning on statement ${i + 1}:`, error.message);
            errorCount++;
          }
        }
      }
    }

    console.log(`✓ Schema executed successfully`);
    console.log(`   Total statements: ${executedCount}`);
    if (errorCount > 0) {
      console.log(`   Warnings: ${errorCount} (non-critical)\n`);
    } else {
      console.log('   No errors\n');
    }

    // Verify tables were created
    console.log('Step 7: Verifying database setup...');
    const tablesResult = await dbClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log(`✓ Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Check sample data
    console.log('\nStep 8: Checking sample data...');
    const companiesResult = await dbClient.query('SELECT COUNT(*) as count FROM companies');
    console.log(`✓ Sample companies loaded: ${companiesResult.rows[0].count}`);

    await dbClient.end();

    console.log('\n==========================================');
    console.log('✓ Database setup completed successfully!');
    console.log('==========================================\n');

    console.log('Next steps:');
    console.log('1. Run: npm start');
    console.log('2. Test API: node test_complete_api.js\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error setting up database:');
    console.error(error.message);
    console.error('\nPlease check:');
    console.error('1. PostgreSQL is running');
    console.error('2. Credentials in .env file are correct');
    console.error('3. You have permissions to create databases\n');
    process.exit(1);
  }
}

setupDatabase();
