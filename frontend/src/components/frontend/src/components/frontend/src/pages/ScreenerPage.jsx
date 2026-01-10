import QueryInput from "../components/QueryInput";
import ResultsView from "../components/ResultsView";

export default function ScreenerPage() {
  const [results, setResults] = useState([]);

  const runQuery = async (query) => {
    const res = await fetch("/api/screener", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ query })
    });
    setResults(await res.json());
  };

  return (
    <>
      <QueryInput onSubmit={runQuery} />
      <ResultsView results={results} />
    </>
  );
}
