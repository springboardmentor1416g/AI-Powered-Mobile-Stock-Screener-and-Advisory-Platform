const validateStructure = require('./validate_structure');
const validateConflicts = require('./validate_conflicts');
const validateRangeRules = require('./validate_range_rules');
const validateDerivedMetrics = require('./validate_derived_metrics');
const validateTemporalRules = require('./validate_temporal_rules');
const validateNullHandling = require('./validate_null_handling');
const { DSLValidationError } = require('./validation_errors');

module.exports = function validateDSLv2(dsl) {
  // Extract the filter node (DSL can have { filter: {...} } or be the filter itself)
  const filterNode = dsl.filter || dsl;
  
  if (!filterNode || typeof filterNode !== 'object') {
    throw new DSLValidationError({
      code: 'INVALID_STRUCTURE',
      message: 'DSL must contain a filter object or be a filter object'
    });
  }

  // Validate all aspects
  validateStructure(filterNode);
  validateConflicts(filterNode);
  validateRangeRules(filterNode); 
  validateDerivedMetrics(filterNode);
  validateTemporalRules(filterNode);
  validateNullHandling(filterNode); 
};
