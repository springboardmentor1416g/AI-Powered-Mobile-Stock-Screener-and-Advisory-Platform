import os
import logging

LOG_DIR = "services/data_validation/logs"
os.makedirs(LOG_DIR, exist_ok=True)  # ensures folder exists

LOG_FILE = os.path.join(LOG_DIR, "validation.log")

logger = logging.getLogger("data_validation_logger")
logger.setLevel(logging.DEBUG)

formatter = logging.Formatter(
    '%(asctime)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

file_handler = logging.FileHandler(LOG_FILE)
file_handler.setFormatter(formatter)
file_handler.setLevel(logging.INFO)

console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
console_handler.setLevel(logging.WARNING)

logger.addHandler(file_handler)
logger.addHandler(console_handler)
