const allowedMetrics = ["price", "pe", "peg", "debt_to_fcf"];

module.exports = function validateRule(rule) {
  if (!allowedMetrics.includes(rule.metric)) {
    throw new Error("Unsupported alert metric");
  }
  return true;
};
