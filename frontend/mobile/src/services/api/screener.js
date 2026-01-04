const API_BASE_URL = "http://localhost:8080/api/v1";

export async function runScreener() {
  const response = await fetch(`${API_BASE_URL}/screener/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // TEMP: auth skipped for now
    },
    body: JSON.stringify({
      filter: {
        and: [{ field: "pe_ratio", operator: "<", value: 15 }]
      }
    })
  });

  if (!response.ok) {
    throw new Error("Failed to run screener");
  }

  return response.json();
}
