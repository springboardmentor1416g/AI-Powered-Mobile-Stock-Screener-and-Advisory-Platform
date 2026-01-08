import { api } from "./client";

// v1 contract placeholder: POST /screener/run?limit=20
export async function runScreener({ queryText, limit = 20 }) {
  // For now we do NOT call backend. Return mock results.
  // Later: send queryText to LLM parser -> DSL -> /screener/run

  return {
    success: true,
    count: 7,
    results: [
      { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", pe_ratio: 24.2 },
      { symbol: "MSFT", name: "Microsoft", sector: "Technology", pe_ratio: 23.8 },
      { symbol: "GOOGL", name: "Alphabet", sector: "Technology", pe_ratio: 18.4 },
    ],
    note: "Mock data (backend integration pending)",
  };
}
