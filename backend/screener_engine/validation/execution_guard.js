module.exports = function executionGuard(dsl) {
  if (!dsl || !dsl.filter) {
    throw new Error('Invalid DSL: missing filter');
  }

  if (!dsl.filter.and) {
    throw new Error('Only AND conditions supported in v1');
  }

  if (dsl.filter.and.length === 0) {
    throw new Error('Empty filter not allowed');
  }
};
