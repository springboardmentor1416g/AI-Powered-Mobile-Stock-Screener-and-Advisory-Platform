exports.validateAlert = (condition) => {
  if (!condition.metric || !condition.operator) {
    throw new Error("Invalid alert condition");
  }
  return true;
};
