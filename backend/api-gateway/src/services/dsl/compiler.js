function compileCondition(c) {
  if (c.logic) {
    return {
      logic: c.logic,
      compiled: c.conditions.map(compileCondition)
    };
  }

  if (c.between) {
    return row =>
      row[c.field] >= c.between[0] &&
      row[c.field] <= c.between[1];
  }

  return row => {
    const v = row[c.field];
    switch (c.operator) {
      case "<": return v < c.value;
      case ">": return v > c.value;
      case "<=": return v <= c.value;
      case ">=": return v >= c.value;
      case "=": return v === c.value;
    }
  };
}

function compileDsl(dsl) {
  const compiled = dsl.conditions.map(compileCondition);
  return row => compiled.every(fn => fn(row));
}

module.exports = { compileDsl };
