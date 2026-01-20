const METRIC_MAP = {
    'pe': 'pe_ratio',
    'pe ratio': 'pe_ratio',
    'p/e': 'pe_ratio',
    'roe': 'roe',
    'roa': 'roa',
    'pb': 'pb_ratio',
    'pb ratio': 'pb_ratio',
    'p/b': 'pb_ratio',
    'revenue': 'revenue',
    'net income': 'net_income',
    'net profit': 'net_income',
    'eps': 'eps',
    'operating margin': 'operating_margin',
    'debt to equity': 'debt_to_equity',
    'debt equity': 'debt_to_equity',
    'market cap': 'market_cap',
    'short term debt': 'short_term_debt',
    'long term debt': 'long_term_debt',
    'capex': 'capex',
    'cfo': 'cfo',
    'operating cash flow': 'cfo'
};

function translateNLToDSL(query) {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Check for OR logic first
    const hasOr = /\s+or\s+/i.test(normalizedQuery);
    const hasAnd = /\s+and\s+/i.test(normalizedQuery);
    
    if (hasOr) {
        return parseOrQuery(normalizedQuery);
    } else if (hasAnd) {
        return parseAndQuery(normalizedQuery);
    } else {
        // Single condition
        const condition = parseCondition(normalizedQuery);
        if (condition) {
            return { filter: { and: [condition] } };
        }
    }
    
    return { filter: {} };
}

// Parse queries with OR logic
function parseOrQuery(query) {
    const orParts = query.split(/\s+or\s+/i);
    const conditions = [];
    
    for (const part of orParts) {
        // Check if this OR part contains AND
        if (/\s+and\s+/i.test(part)) {
            const andConditions = parseAndConditions(part);
            if (andConditions.length > 0) {
                conditions.push({ and: andConditions });
            }
        } else {
            const condition = parseCondition(part.trim());
            if (condition) {
                conditions.push(condition);
            }
        }
    }
    
    if (conditions.length > 0) {
        return { filter: { or: conditions } };
    }
    return { filter: {} };
}

// Parse queries with AND logic
function parseAndQuery(query) {
    const conditions = parseAndConditions(query);
    if (conditions.length > 0) {
        return { filter: { and: conditions } };
    }
    return { filter: {} };
}

// Parse multiple AND conditions
function parseAndConditions(query) {
    const andParts = query.split(/\s+and\s+/i);
    const conditions = [];
    
    for (const part of andParts) {
        const condition = parseCondition(part.trim());
        if (condition) {
            conditions.push(condition);
        }
    }
    
    return conditions;
}

// Parse a single condition with optional time constraints
function parseCondition(conditionStr) {
    // Remove common prefixes like "show stocks with", "find stocks where", etc.
    let cleanedStr = conditionStr
        .replace(/^(show|find|get|list|display)\s+(stocks?|companies?)\s+(with|where|having)\s+/i, '')
        .replace(/^(stocks?|companies?)\s+(with|where|having)\s+/i, '')
        .trim();
    
    // Enhanced pattern to capture metric, operator, value, and optional time constraint
    // Support: below, above, under, over, at least, at most as operator synonyms
    const pattern = /(.+?)\s*(!==|!=|<=|>=|<|>|=|below|above|under|over|at least|at most|less than or equal to|greater than or equal to|less than|greater than|equal to|not equal to)\s*([\d.]+)(?:\s+in\s+last\s+(\d+)\s+(quarters?|years?|months?))?/i;
    
    const match = cleanedStr.match(pattern);
    if (!match) return null;
    
    const metricPhrase = match[1].trim();
    const operatorStr = match[2].trim();
    const value = parseFloat(match[3]);
    const timeCount = match[4] ? parseInt(match[4]) : null;
    const timeUnit = match[5] ? match[5].toLowerCase().replace(/s$/, '') : null;
    
    // Find the metric field
    const field = findMetricField(metricPhrase);
    if (!field) return null;
    
    const operator = normalizeOperator(operatorStr);
    
    const condition = { field, operator, value };
    
    // Add time constraint if present
    if (timeCount && timeUnit) {
        condition.timeframe = {
            type: timeUnit === 'year' ? 'years' : timeUnit === 'month' ? 'months' : 'quarters',
            period: timeCount,
            aggregation: 'latest'
        };
    }
    
    return condition;
}

// Find metric field from natural language
function findMetricField(phrase) {
    const normalized = phrase.toLowerCase().trim();
    
    // Direct match
    if (METRIC_MAP[normalized]) {
        return METRIC_MAP[normalized];
    }
    
    // Partial match
    for (const [key, value] of Object.entries(METRIC_MAP)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return value;
        }
    }
    
    return null;
}

// Helper function to normalize operators
function normalizeOperator(op) {
    const opMap = {
        '<': '<',
        '>': '>',
        '<=': '<=',
        '>=': '>=',
        '=': '=',
        '!=': '!=',
        '!==': '!=',
        'below': '<',
        'under': '<',
        'above': '>',
        'over': '>',
        'at least': '>=',
        'at most': '<=',
        'less than': '<',
        'greater than': '>',
        'equal to': '=',
        'not equal to': '!=',
        'less than or equal to': '<=',
        'greater than or equal to': '>='
    };
    return opMap[op.toLowerCase().trim()] || op;
}

module.exports = { translateNLToDSL };