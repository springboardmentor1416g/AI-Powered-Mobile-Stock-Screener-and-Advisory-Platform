const compileCondition = require('./condition_compiler');

function compileGroup(conditions, startIndex = 1) {
  let sqlParts = [];
  let params = [];
  let index = startIndex;

  for (const condition of conditions) {
    if (condition.and || condition.or) {
      const key = condition.and ? 'and' : 'or';
      const nested = compileGroup(condition[key], index);
      sqlParts.push(`(${nested.sql})`);
      params.push(...nested.params);
      index += nested.params.length;
    } else {
      const compiled = compileCondition(condition, index);
      sqlParts.push(compiled.sql);
      params.push(...compiled.params);
      index++;
    }
  }

  return {
    sql: sqlParts.join(' AND '),
    params
  };
}

module.exports = compileGroup;
