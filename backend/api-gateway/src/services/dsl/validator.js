const { ValidationError } = require("./errors");

const ALLOWED_FIELDS = [
  "pe",
  "eps",
  "revenue_growth",
  "eps_growth",
  "debt",
  "free_cash_flow"
];

function validateConditions(conditions) {
  for (const c of conditions) {

    // Logical nesting
    if (c.logic) {
      validateConditions(c.conditions);
      continue;
    }

    // Field validation
    if (!ALLOWED_FIELDS.includes(c.field)) {
      throw new ValidationError(`Unsupported metric: ${c.field}`, "INVALID_FIELD");
    }

    // Range conflict check
    if (c.between) {
      const [min, max] = c.between;
      if (min >= max) {
        throw new ValidationError("Invalid range bounds", "INVALID_RANGE");
      }
    }

    // Temporal ambiguity
    if (c.window && !c.aggregation) {
      throw new ValidationError(
        "Temporal condition missing aggregation (ALL / ANY / TREND)",
        "AMBIGUOUS_TEMPORAL_RULE"
      );
    }
  }
}

function detectUnsatisfiableRules(conditions) {
  const seen = {};

  for (const c of conditions) {
    if (!c.field || !c.operator) continue;

    seen[c.field] = seen[c.field] || [];
    seen[c.field].push(c);
  }

  for (const field in seen) {
    const rules = seen[field];
    const lt = rules.find(r => r.operator === "<");
    const gt = rules.find(r => r.operator === ">");

    if (lt && gt && gt.value >= lt.value) {
      throw new ValidationError(
        `Unsatisfiable condition on ${field}`,
        "UNSATISFIABLE_RULE"
      );
    }
  }
}

function validateDsl(dsl) {
  if (!dsl.conditions) {
    throw new ValidationError("Missing conditions array", "INVALID_DSL");
  }

  validateConditions(dsl.conditions);
  detectUnsatisfiableRules(dsl.conditions);

  return true;
}

module.exports = { validateDsl };
