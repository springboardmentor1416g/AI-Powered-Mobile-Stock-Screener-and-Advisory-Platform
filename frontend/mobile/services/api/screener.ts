// frontend/mobile/services/api/screener.ts

export interface ScreenerResult {
  symbol: string;
  companyName: string;
  pe?: number;
  revenueGrowth?: number;
}

export interface ScreenerResponse {
  success: boolean;
  count: number;
  results: ScreenerResult[];
}

export async function runScreener(query: string): Promise<ScreenerResponse> {
  // TEMP: backend URL
  const response = await fetch("http://localhost:8081/api/v1/screener/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch screener results");
  }

  return response.json();
}
