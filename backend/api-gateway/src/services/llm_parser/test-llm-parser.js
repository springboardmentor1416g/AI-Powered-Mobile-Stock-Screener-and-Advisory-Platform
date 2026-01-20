/**
    Testng script for LLM Parser Service
 */

const llmParserService = require('./llmParser.service');

async function testLLMParser() {
  console.log('=== LLM Parser Service Tests ===\n');

  // Test 1: Simple query
  console.log('Test 1: Simple PE query');
  const test1 = await llmParserService.processQuery('PE less than 15', {
    userId: 'test_user_1'
  });
  console.log('Success:', test1.success);
  console.log('DSL:', JSON.stringify(test1.dsl, null, 2));
  console.log('---\n');

  // Test 2: Multiple conditions
  console.log('Test 2: Multiple conditions (AND)');
  const test2 = await llmParserService.processQuery('PE less than 15 and ROE greater than 20', {
    userId: 'test_user_2'
  });
  console.log('Success:', test2.success);
  console.log('DSL:', JSON.stringify(test2.dsl, null, 2));
  console.log('---\n');

  // Test 3: Invalid query
  console.log('Test 3: Invalid/empty query');
  try {
    const test3 = await llmParserService.processQuery('', {
      userId: 'test_user_3'
    });
    console.log('Success:', test3.success);
    console.log('Error:', test3.error);
  } catch (error) {
    console.log('Caught error (expected):', error.message);
  }
  console.log('---\n');

  // Test 4: Request logs
  console.log('Test 4: Request logs');
  const logs = llmParserService.getRequestLogs(3);
  console.log('Recent requests:', logs.length);
  console.log('Last request ID:', logs[logs.length - 1]?.requestId);
  console.log('---\n');

  console.log('=== All Tests Complete ===');
}

// Run tests
testLLMParser().catch(console.error);
