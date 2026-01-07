const { translateNLToDSL } = require('../services/llm_stub/llm_stub');
const compilerService = require('../services/screener_compiler/compiler.service');
const runnerService = require('../services/screener_runner/runner.service');

// Run screener with full NL → DSL → SQL → Results pipeline
exports.runScreener = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  console.log('Received query:', query);

  try {
    // Step 1: Translate natural language to DSL
    const dsl = translateNLToDSL(query);
    console.log('DSL:', JSON.stringify(dsl, null, 2));

    // Validate that the query was parsed
    if (!dsl.filter || (Object.keys(dsl.filter).length === 0)) {
      return res.status(400).json({
        error: 'Could not understand your query. Please try something like: "companies with PE ratio less than 15" or "ROE greater than 20"'
      });
    }

    // Step 2: Compile DSL to SQL
    const { sql, params } = compilerService.compile(dsl);
    console.log('SQL:', sql);
    console.log('Params:', params);

    // Step 3: Execute SQL query
    const result = await runnerService.execute(sql, params);

    if (!result.success) {
      return res.status(500).json({
        error: result.error || 'Query execution failed'
      });
    }

    // Return results
    res.json({
      results: result.results,
      count: result.count,
      executionTime: result.executionTime
    });

  } catch (error) {
    console.error('Screener error:', error);
    res.status(500).json({
      error: error.message || 'An error occurred while processing your query'
    });
  }
};