# How to run data validation (quick)

Prerequisites: Python deps installed (see requirements.txt).

From repo root execute:
python services/data_validation/validate_data.py

diff
Copy code

This will process the sample data in the script or accept a dict input in the script's main.
Generated reports appear in:
- services/data_validation/reports/
Logs appear in:
- services/data_validation/logs/
