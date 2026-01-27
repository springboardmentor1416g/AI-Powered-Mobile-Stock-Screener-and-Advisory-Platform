# Setup & Installation Guide

## Prerequisites

- **Node.js**: v16+ 
- **PostgreSQL**: v14+
- **npm** or **yarn**
- **Expo CLI** (for mobile development)

---

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server
PORT=8080
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stock_screener
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRY=7d

# Twelve Data API
TWELVE_DATA_API_KEY=your_api_key_here
TWELVE_DATA_BASE_URL=https://api.twelvedata.com

# Logging
LOG_LEVEL=info
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Setup Database

```bash
# Create PostgreSQL database
createdb stock_screener

# Run schema setup
npm run setup:db

# Or manually with psql
psql -U postgres -d stock_screener -f database/schema.sql
```

### 4. Load Initial Data

```bash
node scripts/initial_data_load.js
```

### 5. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will start on `http://localhost:8080`

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure API Endpoint

Edit `src/config/api.js`:

```javascript
const LAN_IP = "YOUR_LAPTOP_IP"; // Update to your machine's IP
const PORT = 8080;

export const API_BASE =
  Platform.OS === "web"
    ? `http://localhost:${PORT}`
    : `http://${LAN_IP}:${PORT}`;
```

**Find your IP:**
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

### 3. Start Development Server

```bash
# Web
npm run web

# Android
npm run android

# iOS
npm run ios

# Or start Expo CLI
npm start
```

---

## Database Migrations

### Run All Migrations

```bash
cd backend
npm run migrate

# Or manually
node -e "
const MigrationService = require('./database/src/services/MigrationService');
MigrationService.runAllMigrations().then(r => console.log(r));
"
```

### Check Database Status

```bash
node -e "
const MigrationService = require('./database/src/services/MigrationService');
MigrationService.getDatabaseStatus().then(r => console.log(JSON.stringify(r, null, 2)));
"
```

---

## Project Structure

```
stock-screener/
├── backend/
│   ├── src/
│   │   ├── config/          # Config files
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   └── utils/           # Helper functions
│   ├── database/
│   │   ├── schema.sql       # Database schema
│   │   └── src/             # Database utilities
│   ├── scripts/             # Data loading scripts
│   ├── logs/                # Log files
│   ├── server.js            # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── config/          # API config
│   │   ├── screens/         # UI screens
│   │   ├── services/        # API clients
│   │   ├── context/         # React Context
│   │   └── components/      # Reusable components
│   ├── App.js               # Root component
│   └── package.json
│
└── docs/
    ├── API_DOCUMENTATION.md
    ├── DATABASE_SCHEMA.md
    └── SETUP_GUIDE.md
```

---

## Testing

### Backend API Tests

```bash
cd backend

# Test database connection
node test_db_connection.js

# Test Twelve Data API
node test_twelve_data.js

# Test complete API
node test_complete_api.js
```

### Frontend Testing

```bash
cd frontend

# Web version
npm run web

# Mobile emulator
npm run android  # or npm run ios
```

---

## Common Issues

### Database Connection Error

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Start PostgreSQL
# macOS
brew services start postgresql

# Windows (using PostgreSQL service)
# Services > PostgreSQL > Start

# Linux
sudo systemctl start postgresql
```

---

### JWT Token Issues

**Problem:** `401 Invalid or expired token`

**Solution:**
- Ensure `JWT_SECRET` is set in `.env`
- Check token expiry (default: 7 days)
- Refresh token using POST `/api/v1/auth/refresh`

---

### CORS Errors

**Problem:** `CORS policy: Cross-Origin Request Blocked`

**Solution:**
- Ensure API URL is correctly set in frontend config
- Check backend CORS settings in `server.js`
- Add frontend URL to `cors()` whitelist

---

### API Key Issues

**Problem:** `401 Unauthorized` from Twelve Data API

**Solution:**
- Get free API key from https://twelvedata.com
- Add to `.env` file: `TWELVE_DATA_API_KEY=your_key_here`
- Restart backend server

---

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 8080 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | stock_screener |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | postgres |
| `JWT_SECRET` | JWT signing key | - |
| `JWT_EXPIRY` | Token expiry time | 7d |
| `TWELVE_DATA_API_KEY` | Market data API key | - |
| `LOG_LEVEL` | Logging level | info |

---

## Performance Optimization

### Database

```bash
# Create missing indexes
psql -U postgres -d stock_screener -c "
CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);
CREATE INDEX IF NOT EXISTS idx_price_history_ticker_time ON price_history(ticker, time DESC);
"

# Run VACUUM ANALYZE
psql -U postgres -d stock_screener -c "VACUUM ANALYZE;"
```

### API

- Use pagination: `limit=50&offset=0`
- Cache frequently accessed data
- Monitor slow queries: `SELECT * FROM pg_stat_statements;`

### Frontend

- Enable caching in AsyncStorage
- Lazy load components
- Minimize bundle size with tree-shaking

---

## Deployment

### Backend Deployment

```bash
# Build
npm run build

# Deploy to Heroku/AWS/GCP
# Set environment variables in deployment platform
# Deploy code
```

### Frontend Deployment

```bash
# Build for web
npm run build

# Deploy to Netlify/Vercel
# Connect GitHub repository
# Set environment variables
# Deploy
```

---

## Support & Resources

- **API Docs**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Database Schema**: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- **React Native Docs**: https://reactnative.dev
- **Expo Docs**: https://docs.expo.dev
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

*Last Updated: January 27, 2024*
