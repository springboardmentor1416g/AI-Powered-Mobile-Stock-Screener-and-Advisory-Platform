import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Watchlist() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get("/watchlist").then(res => setList(res.data));
  }, []);

  return (
    <div>
      <h2>Watchlist</h2>
      {list.map(stock => <p key={stock._id}>{stock.stockId}</p>)}
    </div>
  );
}
