// services/screener/validator.js

const ALLOWED_FIELDS = {
  pe_ratio: "number",
  roe: "number",
  net_profit: "number",
  revenue_growth_yoy: "number",
};

const ALLOWED_OPERATORS = ["<", ">", "<=", ">=", "=", "!=", "between", "exists"];

function validateDSL(dsl) {
  if (!dsl || typeof dsl !== "object") {
    throw badRequest("DSL must be a JSON object");
  }

  if (!dsl.filter) {
    throw badRequest("Missing filter block");
  }

  validateFilterNode(dsl.filter);
}

function validateFilterNode(node) {
  const keys = Object.keys(node);

  // Only one logical operator allowed
  const logicalKeys = keys.filter(k => ["and", "or", "not"].includes(k));
  if (logicalKeys.length !== 1) {
    throw badRequest("Filter node must contain exactly one of and/or/not");
  }

  if (node.and || node.or) {
    const conditions = node.and || node.or;

    if (!Array.isArray(conditions) || conditions.length === 0) {
      throw badRequest("Logical operator must contain a non-empty array");
    }

    conditions.forEach(validateConditionOrGroup);
  }

  if (node.not) {
    validateConditionOrGroup(node.not);
  }
}

function validateConditionOrGroup(obj) {
  if (obj.field) {
    validateCondition(obj);
  } else {
    validateFilterNode(obj);
  }
}

function validateCondition(condition) {
  const { field, operator, value } = condition;

  if (!ALLOWED_FIELDS[field]) {
    throw badRequest(`Unsupported field: ${field}`);
  }

  if (!ALLOWED_OPERATORS.includes(operator)) {
    throw badRequest(`Unsupported operator: ${operator}`);
  }

  if (operator !== "exists") {
    if (value === undefined || value === null) {
      throw badRequest(`Missing value for field: ${field}`);
    }

    if (ALLOWED_FIELDS[field] === "number" && typeof value !== "number") {
      throw badRequest(`Field ${field} requires numeric value`);
    }
  }

  if (operator === "between") {
    if (!Array.isArray(value) || value.length !== 2) {
      throw badRequest(`Between operator requires [min, max] array`);
    }
  }
}

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

module.exports = { validateDSL };
