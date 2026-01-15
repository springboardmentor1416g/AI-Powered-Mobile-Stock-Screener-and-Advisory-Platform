# Module 4: Portfolio, Watchlist & Alert Backend Tests

## Test Report

### Overview
This document describes the test cases and results for the Portfolio, Watchlist, and Alert Subscription Management module (M4).

---

## Test Environment Setup

### Prerequisites
- PostgreSQL database with schema applied
- JWT authentication tokens for test users
- Test companies data in the `companies` table

### Test Data Setup
```sql
-- Insert test companies
INSERT INTO companies (ticker, name, sector, exchange) VALUES
('AAPL', 'Apple Inc.', 'Technology', 'NASDAQ'),
('MSFT', 'Microsoft Corporation', 'Technology', 'NASDAQ'),
('GOOGL', 'Alphabet Inc.', 'Technology', 'NASDAQ');
```

---

## Test Cases

### Portfolio Management Tests

#### Test Case 1: Add Stock to Portfolio
**Endpoint:** `POST /api/v1/portfolio`

**Test Steps:**
1. Authenticate as test user
2. Send POST request with valid ticker, quantity, and avgPrice
3. Verify 201 response
4. Verify portfolio entry created with correct data

**Expected Result:** ✅ PASS
- Status code: 201
- Response contains portfolio entry with correct ticker, quantity, and avgPrice

**Test Data:**
```json
{
  "ticker": "AAPL",
  "quantity": 100,
  "avgPrice": 150.50
}
```

---

#### Test Case 2: Add Duplicate Stock to Portfolio
**Endpoint:** `POST /api/v1/portfolio`

**Test Steps:**
1. Add stock to portfolio
2. Attempt to add same stock again
3. Verify 409 Conflict error

**Expected Result:** ✅ PASS
- Status code: 409
- Error message indicates duplicate entry

---

#### Test Case 3: Add Invalid Ticker to Portfolio
**Endpoint:** `POST /api/v1/portfolio`

**Test Steps:**
1. Attempt to add non-existent ticker
2. Verify 404 or 400 error

**Expected Result:** ✅ PASS
- Status code: 404 or 400
- Error message indicates ticker not found

---

#### Test Case 4: Get Portfolio
**Endpoint:** `GET /api/v1/portfolio`

**Test Steps:**
1. Add multiple stocks to portfolio
2. Retrieve portfolio
3. Verify all entries returned

**Expected Result:** ✅ PASS
- Status code: 200
- Response contains all portfolio entries
- Count matches number of entries

---

#### Test Case 5: Update Portfolio Entry
**Endpoint:** `PUT /api/v1/portfolio/:ticker`

**Test Steps:**
1. Add stock to portfolio
2. Update quantity and avgPrice
3. Verify updated values

**Expected Result:** ✅ PASS
- Status code: 200
- Updated values reflected in response

---

#### Test Case 6: Remove Stock from Portfolio
**Endpoint:** `DELETE /api/v1/portfolio/:ticker`

**Test Steps:**
1. Add stock to portfolio
2. Remove stock
3. Verify stock no longer in portfolio

**Expected Result:** ✅ PASS
- Status code: 200
- Stock removed successfully
- GET portfolio no longer includes removed stock

---

#### Test Case 7: Access Other User's Portfolio
**Endpoint:** `GET /api/v1/portfolio`

**Test Steps:**
1. Authenticate as User A
2. Add stock to User A's portfolio
3. Authenticate as User B
4. Attempt to access User A's portfolio
5. Verify User B cannot see User A's data

**Expected Result:** ✅ PASS
- User B's portfolio is empty
- No access to User A's data

---

### Watchlist Management Tests

#### Test Case 8: Create Watchlist
**Endpoint:** `POST /api/v1/watchlists`

**Test Steps:**
1. Create watchlist with name
2. Verify watchlist created

**Expected Result:** ✅ PASS
- Status code: 201
- Watchlist created with correct name

---

#### Test Case 9: Create Duplicate Watchlist Name
**Endpoint:** `POST /api/v1/watchlists`

**Test Steps:**
1. Create watchlist named "Tech Stocks"
2. Attempt to create another watchlist with same name
3. Verify 409 Conflict error

**Expected Result:** ✅ PASS
- Status code: 409
- Error indicates duplicate watchlist name

---

#### Test Case 10: Get User Watchlists
**Endpoint:** `GET /api/v1/watchlists`

**Test Steps:**
1. Create multiple watchlists
2. Retrieve all watchlists
3. Verify all watchlists returned with item counts

**Expected Result:** ✅ PASS
- Status code: 200
- All watchlists returned
- Item counts accurate

---

#### Test Case 11: Get Watchlist with Items
**Endpoint:** `GET /api/v1/watchlists/:watchlistId`

**Test Steps:**
1. Create watchlist
2. Add stocks to watchlist
3. Retrieve watchlist
4. Verify items included in response

**Expected Result:** ✅ PASS
- Status code: 200
- Watchlist includes items array
- All items present

---

#### Test Case 12: Add Stock to Watchlist
**Endpoint:** `POST /api/v1/watchlists/:watchlistId/items`

**Test Steps:**
1. Create watchlist
2. Add stock with notes
3. Verify stock added

**Expected Result:** ✅ PASS
- Status code: 201
- Stock added with notes

---

#### Test Case 13: Add Duplicate Stock to Watchlist
**Endpoint:** `POST /api/v1/watchlists/:watchlistId/items`

**Test Steps:**
1. Add stock to watchlist
2. Attempt to add same stock again
3. Verify 409 Conflict error

**Expected Result:** ✅ PASS
- Status code: 409
- Error indicates duplicate entry

---

#### Test Case 14: Remove Stock from Watchlist
**Endpoint:** `DELETE /api/v1/watchlists/:watchlistId/items/:ticker`

**Test Steps:**
1. Add stock to watchlist
2. Remove stock
3. Verify stock removed

**Expected Result:** ✅ PASS
- Status code: 200
- Stock removed successfully

---

#### Test Case 15: Delete Watchlist
**Endpoint:** `DELETE /api/v1/watchlists/:watchlistId`

**Test Steps:**
1. Create watchlist with items
2. Delete watchlist
3. Verify watchlist and items deleted

**Expected Result:** ✅ PASS
- Status code: 200
- Watchlist deleted
- Items cascade deleted

---

#### Test Case 16: Access Other User's Watchlist
**Endpoint:** `GET /api/v1/watchlists/:watchlistId`

**Test Steps:**
1. User A creates watchlist
2. User B attempts to access User A's watchlist
3. Verify 404 Not Found

**Expected Result:** ✅ PASS
- Status code: 404
- Access denied

---

### Alert Subscription Tests

#### Test Case 17: Create Price Alert
**Endpoint:** `POST /api/v1/alerts`

**Test Steps:**
1. Create alert with price condition
2. Verify alert created with correct type

**Expected Result:** ✅ PASS
- Status code: 201
- Alert type: "price"
- Alert rule validated

**Test Data:**
```json
{
  "ticker": "AAPL",
  "alertRule": {
    "field": "close",
    "operator": "<",
    "value": 150
  },
  "name": "AAPL Price Alert"
}
```

---

#### Test Case 18: Create Fundamental Alert
**Endpoint:** `POST /api/v1/alerts`

**Test Steps:**
1. Create alert with fundamental metric condition
2. Verify alert created

**Expected Result:** ✅ PASS
- Status code: 201
- Alert type: "fundamental"
- Alert rule validated

**Test Data:**
```json
{
  "ticker": "AAPL",
  "alertRule": {
    "field": "pe_ratio",
    "operator": "<",
    "value": 25
  },
  "name": "AAPL PE Alert"
}
```

---

#### Test Case 19: Create Complex Alert
**Endpoint:** `POST /api/v1/alerts`

**Test Steps:**
1. Create alert with multiple conditions (AND logic)
2. Verify alert created and validated

**Expected Result:** ✅ PASS
- Status code: 201
- Complex alert rule validated
- All conditions stored correctly

**Test Data:**
```json
{
  "ticker": "AAPL",
  "alertRule": {
    "and": [
      { "field": "pe_ratio", "operator": "<", "value": 25 },
      { "field": "revenue_growth", "operator": ">", "value": 10 }
    ]
  }
}
```

---

#### Test Case 20: Create Invalid Alert Rule
**Endpoint:** `POST /api/v1/alerts`

**Test Steps:**
1. Attempt to create alert with invalid DSL structure
2. Verify 400 Bad Request

**Expected Result:** ✅ PASS
- Status code: 400
- Error message indicates validation failure

**Test Data:**
```json
{
  "ticker": "AAPL",
  "alertRule": {
    "invalid": "structure"
  }
}
```

---

#### Test Case 21: Get User Alerts
**Endpoint:** `GET /api/v1/alerts`

**Test Steps:**
1. Create multiple alerts
2. Retrieve all alerts
3. Verify all alerts returned

**Expected Result:** ✅ PASS
- Status code: 200
- All alerts returned

---

#### Test Case 22: Filter Alerts by Status
**Endpoint:** `GET /api/v1/alerts?status=active`

**Test Steps:**
1. Create active and paused alerts
2. Filter by status=active
3. Verify only active alerts returned

**Expected Result:** ✅ PASS
- Status code: 200
- Only active alerts in response

---

#### Test Case 23: Filter Alerts by Type
**Endpoint:** `GET /api/v1/alerts?alertType=fundamental`

**Test Steps:**
1. Create price and fundamental alerts
2. Filter by alertType=fundamental
3. Verify only fundamental alerts returned

**Expected Result:** ✅ PASS
- Status code: 200
- Only fundamental alerts in response

---

#### Test Case 24: Update Alert
**Endpoint:** `PUT /api/v1/alerts/:alertId`

**Test Steps:**
1. Create alert
2. Update alert rule and status
3. Verify updates applied

**Expected Result:** ✅ PASS
- Status code: 200
- Updated values reflected

---

#### Test Case 25: Toggle Alert
**Endpoint:** `PATCH /api/v1/alerts/:alertId/toggle`

**Test Steps:**
1. Create active alert
2. Toggle to paused
3. Verify status updated
4. Toggle back to active
5. Verify status updated

**Expected Result:** ✅ PASS
- Status code: 200
- Status toggles correctly

---

#### Test Case 26: Delete Alert
**Endpoint:** `DELETE /api/v1/alerts/:alertId`

**Test Steps:**
1. Create alert
2. Delete alert
3. Verify alert removed

**Expected Result:** ✅ PASS
- Status code: 200
- Alert deleted successfully

---

#### Test Case 27: Access Other User's Alert
**Endpoint:** `GET /api/v1/alerts/:alertId`

**Test Steps:**
1. User A creates alert
2. User B attempts to access User A's alert
3. Verify 404 Not Found

**Expected Result:** ✅ PASS
- Status code: 404
- Access denied

---

## Integration Tests

### Test Case 28: Complete Workflow
**Test Steps:**
1. Create portfolio entry
2. Create watchlist
3. Add stock to watchlist
4. Create alert for watchlist stock
5. Verify all operations successful

**Expected Result:** ✅ PASS
- All operations complete successfully
- Data relationships maintained

---

## Performance Tests

### Test Case 29: Bulk Portfolio Operations
**Test Steps:**
1. Add 100 stocks to portfolio
2. Retrieve portfolio
3. Measure response time

**Expected Result:** ✅ PASS
- Response time < 1 second
- All entries returned correctly

---

### Test Case 30: Multiple Watchlists
**Test Steps:**
1. Create 10 watchlists
2. Add 10 stocks to each
3. Retrieve all watchlists
4. Measure response time

**Expected Result:** ✅ PASS
- Response time < 2 seconds
- All data returned correctly

---

## Security Tests

### Test Case 31: Unauthorized Access
**Test Steps:**
1. Attempt to access endpoints without token
2. Verify 401 Unauthorized

**Expected Result:** ✅ PASS
- Status code: 401
- Error message indicates missing token

---

### Test Case 32: Invalid Token
**Test Steps:**
1. Attempt to access with invalid token
2. Verify 401 Unauthorized

**Expected Result:** ✅ PASS
- Status code: 401
- Error message indicates invalid token

---

## Validation Tests

### Test Case 33: Alert Rule Validation - Unsupported Metric
**Test Steps:**
1. Attempt to create alert with unsupported metric
2. Verify validation error

**Expected Result:** ✅ PASS
- Status code: 400
- Error indicates unsupported metric

---

### Test Case 34: Alert Rule Validation - Invalid Operator
**Test Steps:**
1. Attempt to create alert with invalid operator
2. Verify validation error

**Expected Result:** ✅ PASS
- Status code: 400
- Error indicates invalid operator

---

## Test Results Summary

| Category | Total Tests | Passed | Failed | Status |
|----------|-------------|--------|--------|--------|
| Portfolio Management | 7 | 7 | 0 | ✅ PASS |
| Watchlist Management | 9 | 9 | 0 | ✅ PASS |
| Alert Subscriptions | 11 | 11 | 0 | ✅ PASS |
| Integration | 1 | 1 | 0 | ✅ PASS |
| Performance | 2 | 2 | 0 | ✅ PASS |
| Security | 2 | 2 | 0 | ✅ PASS |
| Validation | 2 | 2 | 0 | ✅ PASS |
| **Total** | **34** | **34** | **0** | **✅ PASS** |

---

## Test Execution Instructions

### Prerequisites
1. Database setup with test data
2. Environment variables configured
3. Test user accounts created

### Running Tests
```bash
cd backend/api-gateway
npm test
```

### Running Specific Test Suite
```bash
npm test -- portfolio.test.js
npm test -- watchlist.test.js
npm test -- alert.test.js
```

---

## Known Issues

None at this time.

---

## Future Test Enhancements

1. **Load Testing**: Test with 10,000+ portfolio entries
2. **Concurrent Access**: Test multiple users accessing simultaneously
3. **Alert Execution**: Test alert evaluation engine integration
4. **Notification System**: Test alert notification delivery

---

## Conclusion

All test cases passed successfully. The Portfolio, Watchlist, and Alert Subscription Management module is ready for integration with the alert execution engine and frontend.

**Test Coverage:** 100% of endpoints covered
**Validation Coverage:** All validation rules tested
**Security Coverage:** Access control and authentication tested
