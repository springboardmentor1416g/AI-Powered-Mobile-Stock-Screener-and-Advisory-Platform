async function parseNlQuery(query) {
  // LLM STUB — deterministic mapping
  if (query.toLowerCase().includes("pe < 5")) {
    return {
      conditions: [
        { field: "pe", operator: "<", value: 5 }
      ]
    };
  }

  if (query.toLowerCase().includes("positive revenue growth")) {
    return {
      conditions: [
        { field: "revenue_growth", operator: ">", value: 0 }
      ]
    };
  }

  throw new Error("Unsupported NL query");
}

module.exports = { parseNlQuery };
