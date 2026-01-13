export interface DerivedMetrics {
  pe?: number;
  peg?: number;
  debtToFCF?: number;
}

export interface TrendMetric {
  value: number;
  direction: "up" | "down" | "flat";
}

export interface CompanyScreenerResult {
  ticker: string;
  name: string;
  matchedConditions: string[];
  derivedMetrics: DerivedMetrics;
  quarterly: Record<string, number>;
  ttm: Record<string, number>;
  trends: Record<string, TrendMetric>;
}
