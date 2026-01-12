module.exports = function validateDSL(dsl) {
  if (!dsl.filters || !Array.isArray(dsl.filters)) {
    throw new Error("Invalid DSL structure");
  }

  dsl.filters.forEach(f => {
    if (!f.field || !f.operator) {
      throw new Error("Invalid filter definition");
    }
  });
};
