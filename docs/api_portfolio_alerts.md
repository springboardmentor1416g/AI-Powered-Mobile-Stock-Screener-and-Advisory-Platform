# Portfolio, Watchlist & Alert Subscription API Documentation

## Overview
This document describes the REST API endpoints for managing user portfolios, watchlists, and alert subscriptions.

All endpoints require authentication via JWT token in the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Portfolio Management

### Add Stock to Portfolio
**POST** `/api/v1/portfolio`

Add a stock to the user's portfolio.

**Request Body:**
```json
{
  "ticker": "AAPL",
  "quantity": 100,
  "avgPrice": 150.50
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Stock added to portfolio",
  "data": {
    "id": 1,
    "user_id": "uuid",
    "ticker": "AAPL",
    "quantity": 100,
    "avg_price": 150.50,
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Ticker is required
- `409 Conflict`: Stock already exists in portfolio
- `404 Not Found`: Ticker not found in companies table

---

### Get Portfolio
**GET** `/api/v1/portfolio`

Retrieve all stocks in the user's portfolio.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ticker": "AAPL",
      "company_name": "Apple Inc.",
      "quantity": 100,
      "avg_price": 150.50,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ],
  "count": 1
}
```

---

### Get Portfolio Entry
**GET** `/api/v1/portfolio/:ticker`

Get a specific portfolio entry by ticker.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ticker": "AAPL",
    "company_name": "Apple Inc.",
    "quantity": 100,
    "avg_price": 150.50,
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: Portfolio entry not found

---

### Update Portfolio Entry
**PUT** `/api/v1/portfolio/:ticker`

Update quantity and/or average price for a portfolio entry.

**Request Body:**
```json
{
  "quantity": 150,
  "avgPrice": 155.00
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Portfolio entry updated",
  "data": {
    "id": 1,
    "user_id": "uuid",
    "ticker": "AAPL",
    "quantity": 150,
    "avg_price": 155.00,
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T11:00:00Z"
  }
}
```

---

### Remove Stock from Portfolio
**DELETE** `/api/v1/portfolio/:ticker`

Remove a stock from the portfolio.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Stock removed from portfolio",
  "data": {
    "id": 1,
    "ticker": "AAPL"
  }
}
```

---

## Watchlist Management

### Create Watchlist
**POST** `/api/v1/watchlists`

Create a new watchlist for the user.

**Request Body:**
```json
{
  "name": "Tech Stocks"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Watchlist created",
  "data": {
    "id": 1,
    "user_id": "uuid",
    "name": "Tech Stocks",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

---

### Get User Watchlists
**GET** `/api/v1/watchlists`

Get all watchlists for the user.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Tech Stocks",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z",
      "item_count": "5"
    }
  ],
  "count": 1
}
```

---

### Get Watchlist
**GET** `/api/v1/watchlists/:watchlistId`

Get a specific watchlist with all its items.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": "uuid",
    "name": "Tech Stocks",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z",
    "items": [
      {
        "id": 1,
        "ticker": "AAPL",
        "company_name": "Apple Inc.",
        "added_at": "2025-01-15T10:00:00Z",
        "notes": "Watching for earnings"
      }
    ]
  }
}
```

---

### Update Watchlist Name
**PUT** `/api/v1/watchlists/:watchlistId`

Update the name of a watchlist.

**Request Body:**
```json
{
  "name": "Technology Watchlist"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Watchlist updated",
  "data": {
    "id": 1,
    "name": "Technology Watchlist",
    "updated_at": "2025-01-15T11:00:00Z"
  }
}
```

---

### Delete Watchlist
**DELETE** `/api/v1/watchlists/:watchlistId`

Delete a watchlist and all its items.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Watchlist deleted",
  "data": {
    "id": 1,
    "name": "Tech Stocks"
  }
}
```

---

### Add Stock to Watchlist
**POST** `/api/v1/watchlists/:watchlistId/items`

Add a stock to a watchlist.

**Request Body:**
```json
{
  "ticker": "AAPL",
  "notes": "Watching for earnings announcement"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Stock added to watchlist",
  "data": {
    "id": 1,
    "watchlist_id": 1,
    "ticker": "AAPL",
    "added_at": "2025-01-15T10:00:00Z",
    "notes": "Watching for earnings announcement"
  }
}
```

---

### Remove Stock from Watchlist
**DELETE** `/api/v1/watchlists/:watchlistId/items/:ticker`

Remove a stock from a watchlist.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Stock removed from watchlist",
  "data": {
    "id": 1,
    "ticker": "AAPL"
  }
}
```

---

## Alert Subscription Management

### Create Alert
**POST** `/api/v1/alerts`

Create a new alert subscription.

**Request Body:**
```json
{
  "ticker": "AAPL",
  "alertRule": {
    "field": "pe_ratio",
    "operator": "<",
    "value": 25
  },
  "name": "AAPL PE Alert",
  "alertType": "fundamental",
  "evaluationFrequency": "daily",
  "status": "active"
}
```

**Alert Rule Structure:**
Alert rules follow the Screener DSL format. They can be:
- Simple condition: `{ "field": "pe_ratio", "operator": "<", "value": 25 }`
- Complex filter with logical operators:
```json
{
  "and": [
    { "field": "pe_ratio", "operator": "<", "value": 25 },
    { "field": "revenue_growth", "operator": ">", "value": 10 }
  ]
}
```

**Supported Operators:** `<`, `>`, `<=`, `>=`, `=`, `!=`

**Supported Alert Types:**
- `price`: Price-based alerts
- `fundamental`: Fundamental metric alerts
- `event`: Event-based alerts (buybacks, earnings)
- `time_based`: Time-windowed conditions

**Evaluation Frequencies:**
- `realtime`: Evaluated in real-time
- `hourly`: Evaluated every hour
- `daily`: Evaluated daily (default)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Alert subscription created",
  "data": {
    "id": 1,
    "user_id": "uuid",
    "ticker": "AAPL",
    "alert_rule": {
      "field": "pe_ratio",
      "operator": "<",
      "value": 25
    },
    "name": "AAPL PE Alert",
    "alert_type": "fundamental",
    "evaluation_frequency": "daily",
    "status": "active",
    "active": true,
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid alert rule or missing required fields
- `404 Not Found`: Ticker not found

---

### Get User Alerts
**GET** `/api/v1/alerts`

Get all alerts for the user. Supports filtering via query parameters.

**Query Parameters:**
- `status`: Filter by status (`active`, `paused`, `triggered`)
- `alertType`: Filter by alert type (`price`, `fundamental`, `event`, `time_based`)
- `ticker`: Filter by ticker symbol

**Example:**
```
GET /api/v1/alerts?status=active&alertType=fundamental
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": "uuid",
      "ticker": "AAPL",
      "alert_rule": {
        "field": "pe_ratio",
        "operator": "<",
        "value": 25
      },
      "name": "AAPL PE Alert",
      "alert_type": "fundamental",
      "evaluation_frequency": "daily",
      "status": "active",
      "active": true,
      "triggered_at": null,
      "last_evaluated_at": null,
      "notification_sent": false,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ],
  "count": 1
}
```

---

### Get Alert
**GET** `/api/v1/alerts/:alertId`

Get a specific alert by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": "uuid",
    "ticker": "AAPL",
    "alert_rule": {
      "field": "pe_ratio",
      "operator": "<",
      "value": 25
    },
    "name": "AAPL PE Alert",
    "alert_type": "fundamental",
    "evaluation_frequency": "daily",
    "status": "active",
    "active": true,
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

---

### Update Alert
**PUT** `/api/v1/alerts/:alertId`

Update an alert subscription.

**Request Body:**
```json
{
  "alertRule": {
    "field": "pe_ratio",
    "operator": "<",
    "value": 20
  },
  "name": "Updated AAPL Alert",
  "status": "paused",
  "evaluationFrequency": "hourly"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alert updated",
  "data": {
    "id": 1,
    "user_id": "uuid",
    "ticker": "AAPL",
    "alert_rule": {
      "field": "pe_ratio",
      "operator": "<",
      "value": 20
    },
    "name": "Updated AAPL Alert",
    "status": "paused",
    "evaluation_frequency": "hourly",
    "updated_at": "2025-01-15T11:00:00Z"
  }
}
```

---

### Delete Alert
**DELETE** `/api/v1/alerts/:alertId`

Delete an alert subscription.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alert deleted",
  "data": {
    "id": 1,
    "ticker": "AAPL",
    "name": "AAPL PE Alert"
  }
}
```

---

### Toggle Alert
**PATCH** `/api/v1/alerts/:alertId/toggle`

Enable or disable an alert.

**Request Body:**
```json
{
  "active": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alert disabled",
  "data": {
    "id": 1,
    "status": "paused",
    "active": false
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Missing token",
  "error_code": "UNAUTHORIZED"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied",
  "error_code": "FORBIDDEN"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal Server Error",
  "error_code": "SERVER_ERROR",
  "trace_id": "uuid"
}
```

---

## Alert Rule Examples

### Price Alert
```json
{
  "field": "close",
  "operator": "<",
  "value": 150
}
```

### Fundamental Alert
```json
{
  "field": "pe_ratio",
  "operator": "<",
  "value": 20
}
```

### Complex Alert (Multiple Conditions)
```json
{
  "and": [
    { "field": "pe_ratio", "operator": "<", "value": 25 },
    { "field": "revenue_growth", "operator": ">", "value": 10 },
    { "field": "debt_to_fcf", "operator": "<", "value": 2 }
  ]
}
```

### Range Alert
```json
{
  "field": "pe_ratio",
  "range": {
    "min": 10,
    "max": 20,
    "inclusive": true
  }
}
```

---

## Notes

1. **Data Isolation**: All endpoints enforce user-level data isolation. Users can only access their own portfolios, watchlists, and alerts.

2. **Ticker Validation**: All tickers are validated against the `companies` table. Invalid tickers will return a 404 error.

3. **Duplicate Prevention**: The system prevents duplicate entries in portfolios and watchlists.

4. **Alert Validation**: Alert rules are validated using the Screener DSL validation engine to ensure they are safe and executable.

5. **Transaction Safety**: All database operations use transactions to ensure data consistency.
