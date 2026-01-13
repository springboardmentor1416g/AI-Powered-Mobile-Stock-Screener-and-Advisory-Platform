module.exports = async function parseNL(query) {
  if (query.includes("PE < 5")) {
    return {
      filters: [{ field: "pe", operator: "<", value: 5 }]
    };
  }

  if (query.includes("positive revenue growth")) {
    return {
      filters: [{ field: "revenueGrowth", operator: ">", value: 0 }]
    };
  }

  throw new Error("Unsupported NL query");
};
