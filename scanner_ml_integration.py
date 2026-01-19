import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Union

import joblib
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model

BASE_DIR = Path(__file__).resolve().parent
ML_DIR = BASE_DIR / "ml"
LOG_DIR = BASE_DIR / "logs"
OUTPUT_DIR = BASE_DIR / "output"

LOG_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

timestamp_str = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
log_file = LOG_DIR / f"scanner_inference_{timestamp_str}.log"

logging.basicConfig(
    filename=log_file,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


class SessionAnomalyScorer:
    def __init__(self) -> None:
        self.iforest = joblib.load(ML_DIR / "isolation_forest_model.pkl")
        self.preprocess = joblib.load(ML_DIR / "preprocessing_pipeline.pkl")
        self.autoencoder = load_model(ML_DIR / "autoencoder_model.h5")

    def _to_dataframe(
        self,
        data: Union[Dict[str, Any], List[Dict[str, Any]], pd.DataFrame]
    ) -> pd.DataFrame:
        if isinstance(data, pd.DataFrame):
            return data.copy()
        if isinstance(data, dict):
            return pd.DataFrame([data])
        if isinstance(data, list):
            return pd.DataFrame(data)
        raise ValueError("Unsupported input type for session features")

    def score_sessions(
        self,
        data: Union[Dict[str, Any], List[Dict[str, Any]], pd.DataFrame]
    ) -> List[Dict[str, Any]]:
        df_raw = self._to_dataframe(data)

        if "session_id" not in df_raw.columns:
            df_raw["session_id"] = [f"session_{i}" for i in range(len(df_raw))]

        df_features = df_raw.drop(columns=["session_id"], errors="ignore")

        X = self.preprocess.transform(df_features)

        iforest_scores = self.iforest.decision_function(X)
        iforest_pred = self.iforest.predict(X)  # 1 = normal, -1 = anomaly

        X_recon = self.autoencoder.predict(X)
        recon_error = np.mean(np.square(X - X_recon), axis=1)

        ae_threshold = float(np.percentile(recon_error, 95))
        ae_anom = recon_error > ae_threshold
        iforest_anom = iforest_pred == -1

        results: List[Dict[str, Any]] = []
        for i, row in df_raw.iterrows():
            final_label = "anomalous" if (iforest_anom[i] or ae_anom[i]) else "normal"
            result = {
                "session_id": str(row.get("session_id")),
                "iforest_score": float(iforest_scores[i]),
                "autoencoder_error": float(recon_error[i]),
                "final_label": final_label,
            }
            results.append(result)

            logger.info(json.dumps(result))

        return results


if __name__ == "__main__":
    scorer = SessionAnomalyScorer()
    sample_session = {
        "session_id": "test_1",
        "ip_reputation_score": 0.3,
        "failed_login_attempts": 5,
        "device_change_flag": 1,
        "country_mismatch_flag": 1,
        "hour_of_day": 2,
    }
    res = scorer.score_sessions(sample_session)
    print(json.dumps(res, indent=2))
