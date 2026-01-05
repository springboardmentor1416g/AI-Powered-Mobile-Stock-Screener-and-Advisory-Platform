import React, { useState } from "react";

function Screener({ onResults }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const runScreener = async () => {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/screener", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      onResults(data.data);
    } catch (error) {
      alert("Error connecting to backend");
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Stock Screener</h2>

      <input
        type="text"
        placeholder="Example: price > 100"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <br /><br />

      <button onClick={runScreener} disabled={loading}>
        {loading ? "Running..." : "Run Screener"}
      </button>
    </div>
  );
}

export default Screener;
