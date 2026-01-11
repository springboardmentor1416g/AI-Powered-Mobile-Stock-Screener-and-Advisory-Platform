import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Portfolio() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/portfolio").then(res => setData(res.data));
  }, []);

  return (
    <div>
      <h2>Portfolio</h2>
      {data.map(p => (
        <p key={p._id}>{p.stockId} - {p.quantity}</p>
      ))}
    </div>
  );
}
