const compileCondition = require('./condition_compiler');

function compileGroup(conditions, joiner = 'AND', startIndex = 1) {
  let sqlParts = [];
  let params = [];
  let index = startIndex;

  for (const condition of conditions) {
    if (condition.and) {
      const nested = compileGroup(condition.and, 'AND', index);
      sqlParts.push(`(${nested.sql})`);
      params.push(...nested.params);
      index += nested.params.length;
    } 
    else if (condition.or) {
      const nested = compileGroup(condition.or, 'OR', index);
      sqlParts.push(`(${nested.sql})`);
      params.push(...nested.params);
      index += nested.params.length;
    } 
    else {
      const compiled = compileCondition(condition, index);
      sqlParts.push(compiled.sql);
      params.push(...compiled.params);
      index++;
    }
  }

  return {
    sql: sqlParts.join(` ${joiner} `),
    params
  };
}

module.exports = compileGroup;
