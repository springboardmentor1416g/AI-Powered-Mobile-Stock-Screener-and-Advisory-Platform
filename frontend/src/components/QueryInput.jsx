export default function QueryInput({ onSubmit }) {
  const [query, setQuery] = useState("");

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <button onClick={() => onSubmit(query)}>Search</button>
    </>
  );
}
