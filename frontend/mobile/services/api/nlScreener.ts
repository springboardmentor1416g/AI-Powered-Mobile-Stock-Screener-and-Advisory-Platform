export async function runNlScreener(query: string) {
  const response = await fetch(
    "http://localhost:8081/api/v1/nl-screener/run",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }
  );

  if (!response.ok) {
    throw new Error("Backend error");
  }

  return response.json();
}
