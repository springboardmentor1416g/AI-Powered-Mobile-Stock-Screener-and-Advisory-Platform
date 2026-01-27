CREATE TABLE IF NOT EXISTS technical_indicators_latest (
  ticker TEXT PRIMARY KEY REFERENCES companies(ticker) ON DELETE CASCADE,
  asof_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  rsi_14 NUMERIC,
  sma_20 NUMERIC,
  sma_50 NUMERIC,
  sma_200 NUMERIC,

  ret_1m NUMERIC,
  ret_3m NUMERIC,
  ret_6m NUMERIC,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tech_ind_asof_time ON technical_indicators_latest(asof_time);
