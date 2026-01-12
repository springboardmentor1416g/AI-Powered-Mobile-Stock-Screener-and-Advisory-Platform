const KEY = "saved_screener_results";

export function saveResults(results) {
  localStorage.setItem(KEY, JSON.stringify({
    timestamp: Date.now(),
    results
  }));
}

export function loadResults() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw).results : null;
}

export function clearSavedResults() {
  localStorage.removeItem(KEY);
}
