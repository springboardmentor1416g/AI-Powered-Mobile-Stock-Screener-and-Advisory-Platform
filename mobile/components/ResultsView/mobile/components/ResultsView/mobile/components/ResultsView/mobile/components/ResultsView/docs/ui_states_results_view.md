# UI States – Screener Results View

## Loading State
- Display spinner while API request is pending

## Empty State
- Message: "No stocks matched your criteria"

## Error State
- Message: "Unable to fetch screener results"
- No backend error details exposed

## Success State
- Render list of screened stocks with key metrics
