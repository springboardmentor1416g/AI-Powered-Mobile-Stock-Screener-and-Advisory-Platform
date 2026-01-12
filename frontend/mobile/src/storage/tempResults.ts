let savedResults: any[] = [];

export function saveResults(data: any[]) {
  savedResults = data;
}

export function getSavedResults() {
  return savedResults;
}
