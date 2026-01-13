import { create } from "zustand";
import { CompanyScreenerResult } from "../types/screener.types";

interface SavedResultsState {
  results: CompanyScreenerResult[];
  save: (r: CompanyScreenerResult[]) => void;
  clear: () => void;
}

export const useSavedResults = create<SavedResultsState>((set) => ({
  results: [],
  save: (r) => set({ results: r }),
  clear: () => set({ results: [] }),
}));
