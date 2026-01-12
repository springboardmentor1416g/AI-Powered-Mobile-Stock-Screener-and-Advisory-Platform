const screenerSchema = require("../schemas/screener.schema.json");

function buildScreenerPrompt(userQuery) {
  return `
You are a strict JSON generator.

Convert the user's query into a JSON object that matches this JSON Schema:
${JSON.stringify(screenerSchema, null, 2)}

Rules:
- Output ONLY valid JSON (no markdown, no explanation).
- If sector is mentioned like "IT", set filters.sector = "IT".
- If PE < N is mentioned, set filters.pe_lt = N (number).
- Do not invent fields not in the schema.
- If a filter is not present in the query, omit it.

User query: ${userQuery}
`;
}

module.exports = { buildScreenerPrompt };
