const ALLOWED_FIELDS = ["pe", "revenue_growth"];
const ALLOWED_OPERATORS = ["<", ">", "<=", ">=", "="];

function validateDsl(dsl) {
  if (!dsl.conditions || !Array.isArray(dsl.conditions)) {
    throw new Error("Invalid DSL structure");
  }

  for (const c of dsl.conditions) {
    if (!ALLOWED_FIELDS.includes(c.field)) {
      throw new Error(`Unsupported field: ${c.field}`);
    }
    if (!ALLOWED_OPERATORS.includes(c.operator)) {
      throw new Error(`Unsupported operator: ${c.operator}`);
    }
    if (typeof c.value !== "number") {
      throw new Error("DSL value must be numeric");
    }
  }

  return true;
}

module.exports = { validateDsl };