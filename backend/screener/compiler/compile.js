function compileScreener(rule) {
  return function (row) {
    return rule.conditions.every(cond => {
      const left = Number(row[cond.field]);
      const right = cond.value;

      switch (cond.operator) {
        case ">": return left > right;
        case "<": return left < right;
        case ">=": return left >= right;
        case "<=": return left <= right;
        case "==": return left === right;
        default: return false;
      }
    });
  };
}

module.exports = { compileScreener };
