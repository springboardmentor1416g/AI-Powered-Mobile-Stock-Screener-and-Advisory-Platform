DERIVED_METRICS = {
    "PEG_RATIO": {
        "inputs": ["PE", "EPS_GROWTH"],
        "version": "v1",
        "safe": False
    },
    "EPS_CAGR": {
        "inputs": ["EPS_START", "EPS_END", "YEARS"],
        "version": "v1",
        "safe": False
    }
}
