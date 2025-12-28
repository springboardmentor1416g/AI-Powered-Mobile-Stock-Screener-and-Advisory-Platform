function buildPrompt(query) {
  return `Convert the following natural language query into a standard JSON DSL format for screening stocks.
  
  Query: "${query}"
  
  Expected Output Format:
  {
    "type": "AND",
    "conditions": [
      { "field": "revenue", "operator": ">", "value": 1000000 }
    ]
  }
  
  Return ONLY the JSON.`;
}

module.exports = { buildPrompt };