import os
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from tensorflow.keras import Model
from tensorflow.keras.layers import Input, Dense
from tensorflow.keras.optimizers import Adam

BASE_DIR = Path(__file__).resolve().parent
ML_DIR = BASE_DIR


def generate_dummy_data(n_normal: int = 1000, n_anom: int = 50):
    """
    Create synthetic session features:
    [ip_reputation_score, failed_login_attempts, device_change_flag,
     country_mismatch_flag, hour_of_day]
    """
    # Normal data
    ip_rep = np.random.uniform(0.5, 1.0, size=(n_normal, 1))  # good reputation
    failed = np.random.poisson(lam=1.0, size=(n_normal, 1))
    device_change = np.random.binomial(1, 0.1, size=(n_normal, 1))
    country_mismatch = np.random.binomial(1, 0.05, size=(n_normal, 1))
    hour = np.random.uniform(8, 22, size=(n_normal, 1))  # mostly daytime

    normal = np.hstack([ip_rep, failed, device_change, country_mismatch, hour])

    # Anomalies: worse IP score, many failed logins, odd hours
    ip_rep_a = np.random.uniform(0.0, 0.4, size=(n_anom, 1))
    failed_a = np.random.poisson(lam=8.0, size=(n_anom, 1))
    device_change_a = np.random.binomial(1, 0.6, size=(n_anom, 1))
    country_mismatch_a = np.random.binomial(1, 0.5, size=(n_anom, 1))
    hour_a = np.random.uniform(0, 23, size=(n_anom, 1))

    anomalies = np.hstack([ip_rep_a, failed_a, device_change_a, country_mismatch_a, hour_a])

    X = np.vstack([normal, anomalies])
    y = np.hstack([np.zeros(n_normal), np.ones(n_anom)])  # 0 = normal, 1 = anomaly (for reference only)
    return X, y


def build_autoencoder(input_dim: int) -> Model:
    inp = Input(shape=(input_dim,))
    x = Dense(16, activation="relu")(inp)
    x = Dense(8, activation="relu")(x)
    x = Dense(16, activation="relu")(x)
    out = Dense(input_dim, activation="linear")(x)

    model = Model(inputs=inp, outputs=out)
    model.compile(optimizer=Adam(learning_rate=1e-3), loss="mse")
    return model


def main():
    os.makedirs(ML_DIR, exist_ok=True)

    # 1. Generate data
    X, y = generate_dummy_data()
    # Use only normal data to train autoencoder
    X_normal = X[y == 0]

    # 2. Preprocessing pipeline
    preprocess = Pipeline(
        steps=[
            ("scaler", StandardScaler())
        ]
    )
    X_scaled = preprocess.fit_transform(X)

    # 3. Isolation Forest
    iforest = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42,
    )
    iforest.fit(X_scaled)

    # 4. Autoencoder
    input_dim = X_normal.shape[1]
    ae = build_autoencoder(input_dim)
    X_normal_scaled = preprocess.transform(X_normal)
    ae.fit(
        X_normal_scaled,
        X_normal_scaled,
        epochs=10,
        batch_size=32,
        verbose=1,
    )

    # 5. Save artifacts
    joblib.dump(iforest, ML_DIR / "isolation_forest_model.pkl")
    joblib.dump(preprocess, ML_DIR / "preprocessing_pipeline.pkl")
    ae.save(ML_DIR / "autoencoder_model.h5")

    print("Dummy models saved to:", ML_DIR)


if __name__ == "__main__":
    main()
