const fieldMap = require('./field_mapper');

module.exports = function compileCondition(condition, paramIndex) {
  const { field, operator, value } = condition;

  if (!fieldMap[field]) {
    throw new Error(`Unsupported field: ${field}`);
  }

  const operators = {
    '<': '<',
    '>': '>',
    '<=': '<=',
    '>=': '>=',
    '=': '=',
    '!=': '!='
  };

  if (!operators[operator]) {
    throw new Error(`Unsupported operator: ${operator}`);
  }

  return {
    sql: `${fieldMap[field]} ${operators[operator]} $${paramIndex}`,
    params: [value]
  };
};
