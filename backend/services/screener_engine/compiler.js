const fieldMap = require("./field_mapping");

function compileCondition(condition, params) {
  const column = fieldMap[condition.field];
  if (!column) throw new Error("Invalid field");

  params.push(condition.value);

  switch (condition.operator) {
    case "<": return `${column} < $${params.length}`;
    case ">": return `${column} > $${params.length}`;
    case "=": return `${column} = $${params.length}`;
    default:
      throw new Error("Unsupported operator");
  }
}

function compileFilter(filter, params) {
  if (filter.and) {
    return filter.and
      .map(c => compileCondition(c, params))
      .join(" AND ");
  }

  if (filter.or) {
    return filter.or
      .map(c => compileCondition(c, params))
      .join(" OR ");
  }

  throw new Error("Invalid filter");
}

module.exports = { compileFilter };
