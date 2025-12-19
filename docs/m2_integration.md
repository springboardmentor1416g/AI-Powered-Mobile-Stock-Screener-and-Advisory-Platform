# Milestone M2 – Simple Screener UI & End-to-End Integration

## Project
**AI-Powered Mobile Stock Screener & Advisory Platform**

---

## Objective

Milestone M2 validates the **first complete end-to-end screener flow** without LLM or NLP integration.

This milestone confirms that:
- The mobile frontend can accept a screening query
- The backend screener API is reachable and functional
- The system returns and displays screener results correctly
- The DSL → Screener Engine → Results pipeline is operational (with mock data)

---

## End-to-End Flow
```
Mobile App (React Native)
↓
Screener Query Screen
↓
POST /api/v1/screener/run
↓
Backend Screener Route (Mocked Results)
↓
Results Screen (List View)
```

---

## Components Involved

### Frontend
- **Screener Query Screen**
  - Text input for screening query
  - “Run Screener” button
  - Loading and error handling
- **Results Screen**
  - Displays list of matching stocks
  - Shows symbol, name, and sample metrics
- **API Service Layer**
  - Handles HTTP request to backend screener endpoint


---

### Backend
- **API Gateway**
- **Screener Test Endpoint**
  - Accepts query input
  - Validates non-empty query
  - Returns hard-coded mock results

Endpoint:
```
POST /api/v1/screener/run
```

Sample response:
```json
{
  "success": true,
  "results": [
    {
      "symbol": "TCS",
      "name": "Tata Consultancy Services",
      "pe_ratio": 18.2
    },
    {
      "symbol": "INFY",
      "name": "Infosys Ltd",
      "pe_ratio": 21.5
    }
  ]
}
```
## Validation Performed
### Functional Checks

- Mobile app launches successfully

- Navigation between screens works

- User can enter a screener query

- Backend API is called on button press

- Mock results are returned

- Results render correctly on Results screen

## Error Handling

- Empty query returns validation error

- Network/API failures show user-friendly alert

- Loading state prevents duplicate submissions