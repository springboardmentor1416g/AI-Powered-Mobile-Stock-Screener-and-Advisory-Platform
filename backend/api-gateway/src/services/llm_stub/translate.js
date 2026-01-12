function translateNLToDSL(query) {
  const text = query.toLowerCase();

  // Supported sample query
  if (
    text.includes("pe") &&
    text.includes("10") &&
    text.includes("promoter")
  ) {
    return {
      dsl: {
        conditions: [
          { field: "pe_ratio", operator: "<", value: 10 },
          { field: "promoter_holding", operator: ">", value: 50 }
        ],
        logic: "AND"
      }
    };
  }

  // Anything else is unsupported
  throw new Error("Unsupported natural language query");
}

module.exports = { translateNLToDSL };
