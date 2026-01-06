function compileScreener(dsl) {
  // 1. FIX: Remove the strict check that throws "No conditions found"
  // We now allow queries with NO conditions (which means "Show All")
  if (!dsl) {
    throw new Error("Invalid DSL output from AI");
  }

  const clauses = [];
  const values = [];
  let paramIndex = 1;

  const fieldMap = {
    // Company Fields
    "sector": "c.sector",
    "industry": "c.industry",
    "market_cap": "c.market_cap",
    "exchange": "c.exchange",
    "name": "c.name",
    "ticker": "c.ticker",

    // Financials
    "revenue": "f.revenue",
    "sales": "f.revenue",
    "turnover": "f.revenue",
    "net_income": "f.net_income",
    "profit": "f.net_income",
    "earnings": "f.net_income",
    "eps": "f.eps",
    "pe": "f.pe_ratio",
    "pe_ratio": "f.pe_ratio",
    "valuation": "f.pe_ratio",
    "roe": "f.roe",

    // Price
    "price": "p.close",
    "stock_price": "p.close",
    "share_price": "p.close",
    "close": "p.close",
    "volume": "p.volume"
  };

  // 2. FIX: Safely iterate only if conditions exist
  if (dsl.conditions && dsl.conditions.length > 0) {
    dsl.conditions.forEach(condition => {
      const { field, value } = condition;
      let { operator } = condition;
  
      const dbField = fieldMap[field.toLowerCase()];
      if (!dbField) throw new Error(`Unknown field: ${field}`);
  
      // Handle "BETWEEN"
      if (operator.toUpperCase() === "BETWEEN" && Array.isArray(value)) {
        clauses.push(`${dbField} BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
        values.push(value[0]);
        values.push(value[1]);
        paramIndex += 2;
      } 
      // Handle "NOT IN"
      else if (operator.toUpperCase() === "NOT IN" && !Array.isArray(value)) {
        clauses.push(`${dbField} != $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
      // Handle Fuzzy Search
      else if (["LIKE", "ILIKE"].includes(operator.toUpperCase())) {
        const fuzzyValue = value.includes("%") ? value : `%${value}%`;
        clauses.push(`${dbField} ${operator} $${paramIndex}`);
        values.push(fuzzyValue);
        paramIndex++;
      }
      // Standard Operators
      else {
        clauses.push(`${dbField} ${operator} $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });
  }

  const logicOperator = dsl.type === "OR" ? " OR " : " AND ";
  
  // 3. FIX: If no clauses, whereClause becomes empty string "" (which means "Return All")
  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(logicOperator)}` : "";

  const sqlQuery = `
    SELECT DISTINCT ON (c.ticker)
      c.ticker, c.name, c.sector, c.industry, 
      f.revenue, f.pe_ratio, f.net_income,
      p.close as stock_price, p.volume
    FROM companies c
    LEFT JOIN fundamentals_quarterly f ON c.ticker = f.ticker 
    LEFT JOIN price_history p ON c.ticker = p.ticker
    ${whereClause}
    ORDER BY c.ticker, p.time DESC
    LIMIT 50;
  `;

  return { text: sqlQuery, values: values };
}

module.exports = { compileScreener };