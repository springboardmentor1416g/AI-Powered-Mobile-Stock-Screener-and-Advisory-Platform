const API = "http://localhost:8000";

export const getWatchlist = (userId) =>
  fetch(`${API}/watchlist?user_id=${userId}`).then(res => res.json());

export const getAlerts = (userId) =>
  fetch(`${API}/alerts?user_id=${userId}`).then(res => res.json());
