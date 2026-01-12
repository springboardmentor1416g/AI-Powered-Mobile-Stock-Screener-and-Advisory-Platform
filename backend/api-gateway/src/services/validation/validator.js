function validateDSL(dsl) {
  // 1. Structure check
  if (!dsl.conditions || !Array.isArray(dsl.conditions)) {
    return { valid: false, error: "Missing conditions" };
  }

  // 2. Unsatisfiable rule detection
  const fields = {};
  for (const cond of dsl.conditions) {
    if (!fields[cond.field]) fields[cond.field] = [];
    fields[cond.field].push(cond);
  }

  for (const field in fields) {
    const ops = fields[field];
    const lt = ops.find(o => o.operator === "<");
    const gt = ops.find(o => o.operator === ">");
    if (lt && gt && gt.value >= lt.value) {
      return {
        valid: false,
        error: `Unsatisfiable condition on ${field}`
      };
    }
  }

  // 3. Derived metric safety (basic)
  for (const cond of dsl.conditions) {
    if (cond.field === "peg_ratio") {
      return {
        valid: false,
        error: "PEG requires EPS growth validation"
      };
    }
  }

  return { valid: true };
}

module.exports = { validateDSL };
