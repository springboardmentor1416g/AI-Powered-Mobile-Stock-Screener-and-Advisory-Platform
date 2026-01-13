export async function runNLQuery(query) {
  const response = await fetch("http://localhost:3000/api/screener/nl", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      requestId: Date.now().toString()
    })
  });

  return response.json();
}
