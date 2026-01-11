import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.get("/alerts").then(res => setAlerts(res.data));
  }, []);

  return (
    <div>
      <h2>Alerts</h2>
      {alerts.map(a => (
        <p key={a._id}>{a.stockId} - Enabled</p>
      ))}
    </div>
  );
}
