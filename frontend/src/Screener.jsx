import { useState } from "react";

function Screener() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const runScreener = async () => {
    const res = await fetch("http://localhost:5000/api/screener", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });

    const data = await res.json();
    setResults(data.data);
  };

  return (
    <div>
      <input
        placeholder="Example: price > 100"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={runScreener}>Run Screener</button>

      {results.map((s, i) => (
        <p key={i}>{s.company} - ₹{s.price}</p>
      ))}
    </div>
  );
}

export default Screener;
