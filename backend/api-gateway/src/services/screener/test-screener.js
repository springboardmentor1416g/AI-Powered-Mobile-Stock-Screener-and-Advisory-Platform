/**
 * Complete Screener Pipeline Test
 * Tests the full flow: NL Query → DSL → SQL → Results
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../../../.env') });

const llmParser = require('../llm_parser/llmParser.service');
const compiler = require('./compiler.service');
const runner = require('./runner.service');

async function testCompleteFlow() {
  console.log('\n========================================');
  console.log('COMPLETE SCREENER PIPELINE TEST');
  console.log('========================================\n');

  // Test database connection
  console.log('Testing database connection...');
  const connected = await runner.testConnection();
  if (!connected) {
    console.error('Database connection failed. Exiting.');
    return;
  }

  // Test 1: Simple query
  console.log('\nTest 1: Simple PE ratio filter');
  console.log('Query: "PE less than 15"');
  console.log('----------------------------------------');
  
  const query1 = "PE less than 15";
  
  // Step 1: Parse
  const parseResult = await llmParser.processQuery(query1, {
    userId: 'test_user',
    sessionId: 'test_session'
  });

  if (!parseResult.success) {
    console.log('FAILED at Parser stage');
    console.log('Error:', parseResult.error);
    return;
  }
  
  console.log('Step 1 - Parser: SUCCESS');
  console.log('DSL:', JSON.stringify(parseResult.dsl, null, 2));
  
  // Step 2: Compile
  const { sql, params } = compiler.compile(parseResult.dsl);
  console.log('\nStep 2 - Compiler: SUCCESS');
  console.log('SQL:', sql);
  console.log('Params:', params);
  
  // Step 3: Execute
  const execResult = await runner.execute(sql, params);
  
  if (!execResult.success) {
    console.log('\nFAILED at Runner stage');
    console.log('Error:', execResult.error);
    return;
  }
  
  console.log('\nStep 3 - Runner: SUCCESS');
  console.log('Results found:', execResult.count);
  console.log('Execution time:', execResult.executionTime + 'ms');
  
  if (execResult.count > 0) {
    console.log('\nSample results (first 2):');
    execResult.data.slice(0, 2).forEach((row, i) => {
      console.log(`\n${i + 1}. ${row.name || 'N/A'} (${row.ticker})`);
      console.log(`   Sector: ${row.sector || 'N/A'}`);
      console.log(`   Market Cap: ${row.market_cap || 'N/A'}`);
      if (row.pe_ratio) console.log(`   PE Ratio: ${row.pe_ratio}`);
      if (row.roe) console.log(`   ROE: ${row.roe}`);
    });
  } else {
    console.log('\nNo stocks matched the criteria');
  }

  console.log('\n========================================');
  console.log('PIPELINE COMPLETE - ALL STAGES PASSED');
  console.log('========================================\n');
  
  // Close database connection
  await runner.close();
  console.log('Database connection closed.');

  process.exit(0);
}

testCompleteFlow().catch(error => {
  console.error('\nFATAL ERROR:', error);
  process.exit(1);
});
