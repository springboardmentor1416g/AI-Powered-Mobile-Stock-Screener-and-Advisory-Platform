module.exports = {
  compileAndRun: async (dsl) => {
    const compiler = require('../../screener_engine/compiler/screener_compiler');
    const runner = require('../../screener_engine/runner/screener_runner');

    const query = compiler(dsl);
    const results = await runner.run(query);

    return { success: true, results };
  }
};
