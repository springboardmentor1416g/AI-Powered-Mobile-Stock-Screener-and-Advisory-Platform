function validateDSL(dsl) {
  if (!dsl || typeof dsl !== 'object') {
    throw new Error("Invalid DSL: Result is not an object.");
  }
  // Add more specific checks here (e.g., check for 'type' or 'conditions' fields)
  return true;
}

module.exports = { validateDSL };