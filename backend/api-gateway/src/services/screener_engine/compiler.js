const fieldMap = require("./field_mapping");

function compileCondition(condition, values) {
  const column = fieldMap[condition.field];
  if (!column) {
    throw new Error("Unsupported field");
  }

  values.push(condition.value);
  return `${column} ${condition.operator} $${values.length}`;
}

function compileDSL(dsl) {
  const values = [];
  const conditions = dsl.filter.and.map(cond =>
    compileCondition(cond, values)
  );

  const whereClause = conditions.join(" AND ");
  return { whereClause, values };
}

module.exports = { compileDSL };
