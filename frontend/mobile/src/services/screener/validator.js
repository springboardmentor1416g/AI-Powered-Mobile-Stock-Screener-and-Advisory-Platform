const ALLOWED_FIELDS = [
  "market_cap",
  "pe_ratio",
  "price",
  "sector",
  "revenue_growth",
  "debt_to_equity"
];

const ALLOWED_OPERATORS = [">", "<", ">=", "<=", "="];
const ALLOWED_LOGICAL = ["AND", "OR"];

function validateDSL(dsl) {
  if (!dsl || typeof dsl !== "object") {
    throw new Error("Invalid DSL format");
  }

  if (!Array.isArray(dsl.filters) || dsl.filters.length === 0) {
    throw new Error("DSL must contain at least one filter");
  }

  for (const filter of dsl.filters) {
    if (!ALLOWED_FIELDS.includes(filter.field)) {
      throw new Error(`Unsupported field: ${filter.field}`);
    }

    if (!ALLOWED_OPERATORS.includes(filter.operator)) {
      throw new Error(`Unsupported operator: ${filter.operator}`);
    }

    if (filter.value === undefined || filter.value === null) {
      throw new Error(`Missing value for field: ${filter.field}`);
    }
  }

  if (
    dsl.logicalOperator &&
    !ALLOWED_LOGICAL.includes(dsl.logicalOperator)
  ) {
    throw new Error("Invalid logical operator");
  }

  if (dsl.sort) {
    if (!ALLOWED_FIELDS.includes(dsl.sort.field)) {
      throw new Error("Invalid sort field");
    }
    if (!["asc", "desc"].includes(dsl.sort.order)) {
      throw new Error("Invalid sort order");
    }
  }

  if (dsl.limit && (!Number.isInteger(dsl.limit) || dsl.limit <= 0)) {
    throw new Error("Invalid limit value");
  }

  return true;
}

module.exports = { validateDSL };
