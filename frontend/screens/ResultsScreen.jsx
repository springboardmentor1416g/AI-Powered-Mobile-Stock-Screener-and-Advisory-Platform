import { exportToCsv } from "../utils/exportCsv";
import { saveResults } from "../utils/savedResults";
import ScreenerResultCard from "../components/ScreenerResultCard";

export default function ResultsScreen({ results, navigate }) {
  return (
    <div>
      <h2>Screener Results</h2>

      <button onClick={() => exportToCsv(results)}>
        Export CSV
      </button>

      <button onClick={() => saveResults(results)}>
        Save Results
      </button>

      {results.length === 0 && <p>No matching stocks</p>}

      {results.map((r, i) => (
        <ScreenerResultCard
          key={i}
          result={r}
          onSelect={() => navigate("CompanyDetail", r)}
        />
      ))}
    </div>
  );
}
