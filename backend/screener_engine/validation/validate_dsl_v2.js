const validateStructure = require('./validate_structure');
const validateConflicts = require('./validate_conflicts');
const validateRangeRules = require('./validate_range_rules');
const validateDerivedMetrics = require('./validate_derived_metrics');
const validateTemporalRules = require('./validate_temporal_rules');
const validateNullHandling = require('./validate_null_handling');

module.exports = function validateDSLv2(dsl) {
  validateStructure(dsl);
  validateConflicts(dsl);
  validateRangeRules(dsl); 
  validateDerivedMetrics(dsl);
  validateTemporalRules(dsl);
  validateNullHandling(dsl); 
};
