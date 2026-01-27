# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                         │
│  React Native (Mobile) / React Web                           │
│  ├─ Login/Register Screens                                   │
│  ├─ Screener Query Interface                                 │
│  ├─ Results Display                                          │
│  ├─ Portfolio Management                                     │
│  ├─ Watchlist Management                                     │
│  └─ Alert Management                                         │
└────────────────────┬─────────────────────────────────────────┘
                     │ HTTP/REST API
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND API LAYER                         │
│  Express.js (Node.js)                                        │
│  ├─ /api/v1/auth      - Authentication & User Mgmt          │
│  ├─ /api/v1/screener  - Stock Screening Engine              │
│  ├─ /api/v1/market    - Market Data APIs                    │
│  ├─ /api/v1/alerts    - Alert Management                    │
│  ├─ /api/v1/portfolio - Portfolio Tracking                  │
│  └─ /api/v1/watchlist - Watchlist Management                │
└────────────────────┬─────────────────────────────────────────┘
                     │ SQL Queries
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER                                 │
│  PostgreSQL Database                                         │
│  ├─ User Accounts                                            │
│  ├─ Company Metadata                                         │
│  ├─ Price History (Daily/Intraday)                          │
│  ├─ Fundamental Metrics                                      │
│  ├─ Technical Indicators                                     │
│  ├─ Portfolios & Positions                                   │
│  ├─ Watchlists                                               │
│  ├─ Saved Screens                                            │
│  └─ Alerts & Notifications                                   │
└─────────────────────────────────────────────────────────────┘
        ┌──────────────────────────┬──────────────────────────┐
        ▼                          ▼                          ▼
    ┌────────────┐           ┌─────────────┐       ┌──────────────┐
    │ Twelve Data│           │ Node-Cron   │       │ Winston Logger│
    │   API      │           │  Scheduler  │       │              │
    │            │           │  (Alerts)   │       │ (Monitoring) │
    └────────────┘           └─────────────┘       └──────────────┘
```

---

## Component Architecture

### Frontend Components

```
App.js (Root)
├── AuthContext.Provider
│   ├── AuthProvider (Context State)
│   └── useAuth() Hook
│
├── Navigation Stack
│   ├── Auth Screens
│   │   ├── LoginScreen
│   │   └── RegisterScreen
│   │
│   └── App Screens
│       ├── ScreenerQueryScreen
│       ├── ResultsScreen
│       ├── PortfolioScreen
│       ├── WatchlistScreen
│       └── AlertsScreen
│
└── Services
    ├── authService (Token/Session Management)
    ├── screenerService (API Client)
    ├── http (Fetch Wrapper)
    └── API Config
```

### Backend Services

```
Server (Express.js)
├── Config
│   ├── Environment (Variables)
│   ├── Database (PostgreSQL Pool)
│   └── Logger (Winston)
│
├── Middleware
│   ├── CORS (Cross-Origin Requests)
│   ├── Helmet (Security)
│   ├── Rate Limiting
│   ├── Authentication (JWT)
│   └── Logging (Morgan)
│
├── Routes
│   ├── /auth (Registration, Login, Token)
│   ├── /screener (Stock Screening)
│   ├── /market (Price, Profile, Statistics)
│   └── /alerts (Alert Management)
│
├── Services
│   ├── AuthService (JWT, Hashing)
│   ├── ScreenerRunner (Query Execution)
│   │   ├── DSLParser (Query Parsing)
│   │   └── ScreenerCompiler (SQL Generation)
│   ├── TwelveDataService (Market Data API)
│   ├── AlertEngine (Cron-based Monitoring)
│   └── LLMParser (Natural Language → Filter)
│
└── Database
    ├── Schema Management
    ├── Migrations
    └── Health Checks
```

---

## Data Flow

### User Authentication Flow

```
1. User enters email/password
   ↓
2. Frontend: POST /api/v1/auth/login
   ↓
3. AuthService.login()
   - Query user by email
   - Verify password (bcryptjs)
   - Generate JWT token
   ↓
4. Return token + user data
   ↓
5. Frontend stores token (AsyncStorage)
   ↓
6. Subsequent requests include: Authorization: Bearer <token>
```

### Stock Screening Flow

```
1. User enters query
   ↓
2. Frontend: POST /api/v1/screener/run
   ├─ With filter OR natural language
   ↓
3. ScreenerRunner.run()
   - Parse natural language (if needed)
   - Validate filter
   - Compile to SQL via ScreenerCompiler
   ↓
4. DSLParser.parseFilter()
   - Map fields to database columns
   - Build WHERE clause
   - Add parameters (SQL injection prevention)
   ↓
5. Execute query against PostgreSQL
   - JOIN companies, prices, fundamentals, technical
   - Filter by conditions
   - Order and paginate
   ↓
6. Return results + metadata
   ↓
7. Frontend displays in ResultsScreen
```

### Real-time Price Updates

```
(Polling-based, can be upgraded to WebSocket)

1. TwelveDataService.getQuote(symbol)
   - Call Twelve Data API
   - Transform response
   ↓
2. Update latest_prices table (periodic)
   ↓
3. Frontend polls /api/v1/market/quote/:symbol
   - Shows current price
   - Updates alert status
```

### Alert Monitoring Flow

```
1. User creates alert via POST /api/v1/alerts
   ↓
2. Alert stored in alert_subscriptions table
   ↓
3. AlertEngine runs every 5 minutes (cron: */5 * * * *)
   ↓
4. For each active alert:
   - Check current price/indicators
   - Evaluate condition
   - If triggered:
     - Create notification
     - Update last_triggered timestamp
     - Notify user (future: email/SMS)
```

---

## Database Relationships

```
users (1)
├── (1:N) user_portfolios
│   └── (1:N) portfolio_positions
│       └── (N:1) companies
│
├── (1:N) watchlists
│   └── (1:N) watchlist_items
│       └── (N:1) companies
│
├── (1:N) saved_screens
│
├── (1:N) screener_history
│
└── (1:N) alert_subscriptions
    └── (N:1) companies

companies (1)
├── (1:N) price_history
├── (1:N) price_intraday
├── (1:N) fundamentals_quarterly
└── (1:N) technical_indicators_latest
```

---

## Security Architecture

### Authentication & Authorization

```
User Login
    ↓
Generate JWT token
    - Payload: userId, email, isActive
    - Secret: JWT_SECRET env variable
    - Expiry: 7 days
    ↓
Store in Frontend (AsyncStorage)
    ↓
Include in requests: Authorization: Bearer <token>
    ↓
Backend verifies token
    - Validates signature
    - Checks expiry
    - Extracts user ID
    ↓
Proceed with request or reject (401)
```

### Password Security

```
User Registration
    ↓
Validate password (8+ chars)
    ↓
Hash with bcryptjs (10 rounds)
    ↓
Store hash in database
    ↓
User Login
    ↓
Retrieve stored hash
    ↓
Compare input password with hash
    ↓
Match → Return token
No match → Return 401
```

### SQL Injection Prevention

```
User Input: "PE < 20; DROP TABLE users"
    ↓
DSLParser validates field names and operators
    ↓
Parameterized queries: WHERE pe_ratio < $1
    ↓
Parameter value: [20]
    ↓
Database driver prevents injection
```

---

## Scalability Considerations

### Current Architecture (Single Server)

- ✅ Suitable for: Prototypes, POCs, < 10K users
- ⚠️ Limitations: Single point of failure, no horizontal scaling

### Production Scaling

```
┌──────────────────────────────────────────┐
│         Load Balancer (Nginx)            │
└─────────────┬──────────────────┬─────────┘
              ▼                  ▼
        ┌─────────────┐  ┌─────────────┐
        │ API Server 1│  │ API Server 2│
        └──────┬──────┘  └──────┬──────┘
               │                │
        ┌──────▼────────────────▼──────┐
        │   PostgreSQL (Primary)       │
        │   + Read Replicas (RO)       │
        └──────────────┬───────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  Redis Cache Layer          │
        │  (Session, Query Cache)     │
        └─────────────────────────────┘
```

### Optimization Strategies

1. **Caching**
   - Redis for session/query results
   - Client-side AsyncStorage

2. **Database**
   - Read replicas for queries
   - Connection pooling
   - Query optimization with indexes

3. **API**
   - Pagination (default: 100 items)
   - Rate limiting (100 req/15 min)
   - Response compression

4. **Frontend**
   - Code splitting
   - Lazy loading
   - Bundle optimization

---

## Technology Stack Summary

### Frontend
- **Framework**: React Native + Expo
- **Navigation**: React Navigation
- **State**: React Context API
- **Storage**: AsyncStorage
- **HTTP**: Fetch API

### Backend
- **Framework**: Express.js (Node.js)
- **Language**: JavaScript (ES6+)
- **Database**: PostgreSQL 14+
- **Authentication**: JWT + bcryptjs
- **Logging**: Winston
- **Scheduling**: node-cron
- **API Client**: axios

### DevOps
- **Version Control**: Git
- **Package Manager**: npm
- **Testing**: Jest (for unit tests)
- **Deployment**: Docker, AWS/Heroku ready

---

## Development Workflow

```
1. Create feature branch
   git checkout -b feature/user-auth

2. Develop & commit
   git commit -m "Add JWT token refresh"

3. Test
   npm test

4. Push & create PR
   git push origin feature/user-auth

5. Code review

6. Merge to main

7. Deploy
   - Backend: Auto-deploy to production
   - Frontend: Build + deploy to app stores
```

---

*Last Updated: January 27, 2024*
