export const runScreener = async (query) => {
  const response = await fetch("http://localhost:3000/api/screener", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error("API Error");
  }

  const data = await response.json();
  return data.results;
};
