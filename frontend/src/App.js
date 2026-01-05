import React, { useState } from "react";
import Screener from "./Screener";
import Results from "./Results";

function App() {
  const [results, setResults] = useState([]);

  return (
    <div style={{ padding: "20px" }}>
      <Screener onResults={setResults} />
      <Results results={results} />
    </div>
  );
}

export default App;
