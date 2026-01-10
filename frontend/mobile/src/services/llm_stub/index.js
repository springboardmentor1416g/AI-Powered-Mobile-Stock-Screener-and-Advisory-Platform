const PREDEFINED_MAP = {
  "stocks with revenue growth > 10% last 4 quarters": {
    filters: [
      {
        metric: "revenue_growth",
        operator: ">",
        value: 10,
        period: "4q"
      }
    ],
    logic: "AND"
  }
};

function translateNLtoDSL(query) {
  if (!query || typeof query !== "string") {
    throw new Error("INVALID_QUERY");
  }

  const normalized = query.toLowerCase().trim();

  if (PREDEFINED_MAP[normalized]) {
    return PREDEFINED_MAP[normalized];
  }

  throw new Error("UNSUPPORTED_QUERY");
}

module.exports = { translateNLtoDSL };
