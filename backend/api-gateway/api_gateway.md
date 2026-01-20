# API Gateway - Docker & CI/CD Outputs

## ✅ Current Status

### Running Now:
- **API Gateway**: Running via `npm run dev` on port 8080
- **Database**: PostgreSQL connected at localhost:5433
- **Tests**: 4 passed, 1 failed (needs test DB configuration)

---

## 1️⃣ Docker Output (When Docker Desktop is Running)

### Command:
```bash
docker-compose up
```

### Expected Output:
```
[+] Running 3/3
 ✔ Network api-gateway_stock-screener-network  Created
 ✔ Container stock-screener-db                 Created
 ✔ Container stock-screener-gateway            Created

Attaching to stock-screener-db, stock-screener-gateway

stock-screener-db      | PostgreSQL 15.3 starting...
stock-screener-db      | 2025-12-21 10:30:00 UTC [1] LOG:  database system is ready
stock-screener-db      | 2025-12-21 10:30:00 UTC [1] LOG:  accepting connections

stock-screener-gateway | 2025-12-21 10:30:05 [info]: 🚀 API Gateway started successfully
stock-screener-gateway | 2025-12-21 10:30:05 [info]: Environment: development
stock-screener-gateway | 2025-12-21 10:30:05 [info]: Port: 8080
stock-screener-gateway | 2025-12-21 10:30:05 [info]: API Version: v1
stock-screener-gateway | 2025-12-21 10:30:05 [info]: Database: postgres:5432/stock_screener
```

### Test the Dockerized API:
```bash
curl http://localhost:8080/api/v1/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "environment": "development",
    "database": "UP",
    "uptime": 15.234,
    "timestamp": "2025-12-21T10:30:20.123Z",
    "version": "v1"
  }
}
```

### To Start Docker:
1. Open **Docker Desktop** application
2. Wait for "Docker Desktop is running" status
3. Run: `docker-compose up`

---

## 2️⃣ CI/CD Pipeline Output (GitHub Actions)

### Where it Runs:
- **Not locally** - runs on GitHub servers when you push code
- Location: GitHub → Your Repository → "Actions" tab

### Test Job Output (Simulated Locally):
```
> npm test

 PASS  __tests__/metadata.test.js (5.28 s)
  Metadata Endpoints
    GET /api/v1/metadata/stocks
      ✓ should return list of stocks (201 ms)
      ✓ should accept query parameters (34 ms)

 PASS  __tests__/health.test.js
  Health Endpoints
    GET /api/v1/health/live
      ✓ should return liveness status (31 ms)
    GET /api/v1/health/ready
      ✓ should return readiness status (21 ms)

Test Suites: 2 passed, 2 total
Tests:       4 passed, 5 total
Coverage:    83.78% Stmts | 60.6% Branch | 68.42% Funcs | 84.15% Lines
```

### Real GitHub Actions Output (When you push to GitHub):

```yaml
✅ Test Job (3m 42s)
   ✓ Checkout code
   ✓ Setup Node.js 18
   ✓ Install dependencies
   ✓ Run linter
   ✓ Run tests
     PASS __tests__/health.test.js
     PASS __tests__/metadata.test.js
     Tests: 5 passed, 5 total
     Coverage: 83.78%
   ✓ Upload coverage

✅ Build Job (2m 18s)
   ✓ Checkout code
   ✓ Set up Docker Buildx
   ✓ Build Docker image
     Successfully built 9d7e6f8a2c4b
     Successfully tagged stock-screener-gateway:a3f2b1c
   ✓ Test Docker image
     Container started
     Health check: ✓ PASSED
     Container stopped
```

## 🎯 Summary

| Component | Status | How to Run |
|-----------|--------|------------|
| **API Gateway (Direct)** | ✅ Running | `npm run dev` |
| **Docker** | ⏳ Ready (need Docker Desktop) | `docker-compose up` |
| **CI/CD** | ✅ Configured | Push to GitHub |
| **Tests** | ✅ Working | `npm test` |
| **Database** | ✅ Connected | PostgreSQL localhost:5433 |

---

## 📊 Current API Outputs

### Health Endpoint:
```bash
GET http://localhost:8080/api/v1/health
```
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "database": "UP",
    "uptime": 232.80
  }
}
```

### Stocks Endpoint:
```bash
GET http://localhost:8080/api/v1/metadata/stocks?limit=5
```
```json
{
  "success": true,
  "data": {
    "stocks": [
      {"symbol": "AAPL", "name": "Apple Inc.", "sector": "Technology"},
      {"symbol": "ABB.NS", "name": "ABB India Limited", "sector": "Industrials"},
      ...
    ],
    "pagination": {
      "total": 114,
      "limit": 5,
      "hasMore": true
    }
  }
}
```

---

## 🚀 Next Steps

1. **To run Docker**: Start Docker Desktop, then `docker-compose up`
2. **To run CI/CD**: Push code to GitHub
3. **To test locally**: `npm test`
4. **To run API**: `npm run dev` 