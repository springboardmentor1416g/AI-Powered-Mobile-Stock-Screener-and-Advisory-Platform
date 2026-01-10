export default function ResultsView({ results }) {
  return (
    <ul>
      {results.map((stock, i) => (
        <li key={i}>{stock.name}</li>
      ))}
    </ul>
  );
}
