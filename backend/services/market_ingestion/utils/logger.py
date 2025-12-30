import logging
from pathlib import Path
from datetime import datetime

def setup_logger(name: str, logs_dir: str = "logs") -> logging.Logger:
    Path(logs_dir).mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    logfile = Path(logs_dir) / f"ingestion_{name}_{ts}.log"

    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    fmt = logging.Formatter("[%(levelname)s] %(asctime)s - %(message)s")

    fh = logging.FileHandler(logfile, encoding="utf-8")
    fh.setFormatter(fmt)

    sh = logging.StreamHandler()
    sh.setFormatter(fmt)

    # avoid duplicate handlers when re-running in same interpreter
    if not logger.handlers:
        logger.addHandler(fh)
        logger.addHandler(sh)

    logger.info(f"Logging to {logfile}")
    return logger
