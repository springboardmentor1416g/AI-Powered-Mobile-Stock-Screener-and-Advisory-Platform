const API_URL = "http://localhost:5000";

export async function runScreener(query) {
  const res = await fetch(`${API_URL}/screen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });

  if (!res.ok) {
    throw new Error("Failed to fetch screener results");
  }

  return res.json();
}
