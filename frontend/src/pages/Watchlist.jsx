import { useEffect, useState } from "react";
import { getWatchlist } from "../services/api";

export default function Watchlist() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    getWatchlist(1).then(setStocks);
  }, []);

  return (
    <div>
      <h2>Watchlist</h2>
      <ul>
        {stocks.map(s => <li key={s.id}>{s.symbol}</li>)}
      </ul>
    </div>
  );
}
