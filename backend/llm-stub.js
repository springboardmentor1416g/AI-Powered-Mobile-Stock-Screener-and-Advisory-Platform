// llm-stub.js
// Improved LLM Stub: NL → DSL (string-based)

function translateNLtoDSL(nlQuery) {
  const q = nlQuery.toLowerCase();
  const conditions = [];

  // PRICE CONDITION
  if (q.includes("price above") || q.includes("price >")) {
    const match = q.match(/price (above|>) (\d+)/);
    if (match) {
      conditions.push(`price > ${match[2]}`);
    } else {
      conditions.push("price > 200"); // default
    }
  }

  // VOLUME CONDITION
  if (q.includes("high volume") || q.includes("volume")) {
    conditions.push("volume > 1000000");
  }

  // MARKET CAP CONDITION
  if (q.includes("large cap") || q.includes("market cap")) {
    conditions.push("market_cap > 500000000000");
  }

  // NO CONDITIONS FOUND
  if (conditions.length === 0) {
    return null;
  }

  // COMBINE CONDITIONS
  return conditions.join(" AND ");
}

module.exports = { translateNLtoDSL };
