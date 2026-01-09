const validateStructure = require('./validate_structure');
const validateLogic = require('./validate_logic');
const validateMetrics = require('./validate_metrics');
const validateDerivedMetrics = require('./validate_derived_metrics');

function validateDSL(dsl) {
  validateStructure(dsl);
  validateLogic(dsl);
  validateMetrics(dsl);
  validateDerivedMetrics(dsl);
}

module.exports = validateDSL;
