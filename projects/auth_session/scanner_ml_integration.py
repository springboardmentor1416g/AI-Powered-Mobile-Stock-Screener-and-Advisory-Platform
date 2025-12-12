# projects/auth_session/scanner_ml_integration.py
"""
FastAPI service for ML-based session anomaly detection.

Start:
  uvicorn projects.auth_session.scanner_ml_integration:app --host 0.0.0.0 --port 8001

Endpoint:
  POST /predict
  body: {"session_id": "abc", "features": {"f1": 1.2, "f2": 0.3, ...}}

Response:
  {
    "session_id": "...",
    "iforest_score": ...,
    "autoencoder_error": ...,
    "anomalous": true/false,
    "explanation": "..."
  }
"""

import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import joblib
import tensorflow as tf
from keras.losses import MeanSquaredError

MODEL_DIR = os.environ.get("MODEL_DIR", "projects/auth_session/ml")
IF_MODEL_PATH = os.path.join(MODEL_DIR, "isolation_forest_model.pkl")
PREPROCESS_PATH = os.path.join(MODEL_DIR, "preprocessing_pipeline.pkl")
AE_MODEL_PATH = os.path.join(MODEL_DIR, "autoencoder_model.h5")

app = FastAPI(title="Auth Session Scanner")

# -------- LOAD MODELS SAFELY --------

# Isolation Forest
if os.path.exists(IF_MODEL_PATH):
    try:
        if_model = joblib.load(IF_MODEL_PATH)
    except Exception as e:
        print("Failed to load Isolation Forest:", e)
        if_model = None
else:
    if_model = None

# Preprocessing pipeline
if os.path.exists(PREPROCESS_PATH):
    try:
        preproc = joblib.load(PREPROCESS_PATH)
    except Exception as e:
        print("Failed to load preprocessing pipeline:", e)
        preproc = None
else:
    preproc = None

# Autoencoder with custom metric loader
if os.path.exists(AE_MODEL_PATH):
    try:
        ae_model = tf.keras.models.load_model(
            AE_MODEL_PATH,
            custom_objects={"mse": MeanSquaredError()}
        )
    except Exception as e:
        print("Failed to load Autoencoder:", e)
        ae_model = None
else:
    ae_model = None


# -------- REQUEST MODEL --------

class PredictRequest(BaseModel):
    session_id: str
    features: dict


# -------- PREDICTION ENDPOINT --------

@app.post("/predict")
def predict(req: PredictRequest):
    if preproc is None and if_model is None and ae_model is None:
        raise HTTPException(
            status_code=500,
            detail="No ML models found. Place models in projects/auth_session/ml/"
        )

    # Prepare ordered features
    feat_keys = sorted(req.features.keys())
    x = np.array([req.features[k] for k in feat_keys], dtype=float).reshape(1, -1)

    # Apply preprocessing
    if preproc is not None:
        try:
            x_proc = preproc.transform(x)
        except Exception as e:
            x_proc = x  # fallback
    else:
        x_proc = x

    response = {"session_id": req.session_id}

    # ---- Isolation Forest Score ----
    if if_model is not None:
        try:
            score = float(if_model.decision_function(x_proc)[0])
            is_anom_if = bool(if_model.predict(x_proc)[0] == -1)

            response.update({
                "iforest_score": score,
                "iforest_flag": is_anom_if
            })

        except Exception as e:
            response.update({"iforest_error": str(e)})

    # ---- Autoencoder Reconstruction Error ----
    if ae_model is not None:
        try:
            recon = ae_model.predict(x_proc, verbose=0)
            err = float(((x_proc - recon) ** 2).mean())

            threshold = 0.01
            is_anom_ae = err > threshold

            response.update({
                "autoencoder_error": err,
                "autoencoder_flag": bool(is_anom_ae),
                "autoencoder_threshold": threshold
            })

        except Exception as e:
            response.update({"autoencoder_error_exception": str(e)})

    # ---- Final Decision ----
    anomalous = any([
        response.get("iforest_flag"),
        response.get("autoencoder_flag")
    ])

    response.update({"anomalous": bool(anomalous)})

    return response


# -------- HEALTH CHECK --------

@app.get("/health")
def health():
    return {
        "status": "ok",
        "models": {
            "if_model_present": bool(if_model is not None),
            "preprocessing_present": bool(preproc is not None),
            "ae_model_present": bool(ae_model is not None)
        }
    }
