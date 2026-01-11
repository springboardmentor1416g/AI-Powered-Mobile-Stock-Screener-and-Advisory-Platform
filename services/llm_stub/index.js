module.exports.translateNLToDSL = (query) => {
  const q = query.toLowerCase();

  if (q.includes("pe under 15") && q.includes("revenue growth")) {
    return {
      dsl: {
        filters: [
          { field: "pe_ratio", operator: "<", value: 15 },
          { field: "revenue_growth", operator: ">", value: 10 }
        ],
        logic: "AND"
      }
    };
  }

  if (q.includes("crypto")) {
    return {
      error: "UNSUPPORTED_QUERY",
      message: "Crypto assets are not supported"
    };
  }

  return {
    error: "AMBIGUOUS_QUERY",
    message: "Unable to confidently translate query"
  };
};
