async function parseNaturalLanguage(query) {
  const dsl = {};

  // PE condition
  const peMatch = query.match(/PE (below|less than) (\d+)/i);
  if (peMatch) {
    dsl.pe = { operator: "<", value: Number(peMatch[2]) };
  }

  // Promoter holding
  const promoterMatch = query.match(/promoter holding (above|greater than) (\d+)/i);
  if (promoterMatch) {
    dsl.promoterHolding = { operator: ">", value: Number(promoterMatch[2]) };
  }

  // Earnings condition
  if (query.toLowerCase().includes("positive earnings")) {
    dsl.positiveEarnings = true;
  }

  return dsl;
}

module.exports = { parseNaturalLanguage };
