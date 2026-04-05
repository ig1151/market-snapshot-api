📊 Market Snapshot API

A fast, production-ready REST API for retrieving real-time stock market data with API key authentication, usage tracking, and rate limiting.

🚀 Features
🔑 API key authentication
📈 Real-time stock quotes (powered by Twelve Data)
📊 Watchlist endpoint (multiple tickers)
📉 Usage tracking & rate limiting
⚡ Response caching (TTL-based)
🛠 Production-ready deployment (Render + PostgreSQL)
🌐 Base URL
https://market-snapshot-api.onrender.com
🔐 Authentication

All protected endpoints require an API key:

x-api-key: YOUR_API_KEY
📌 Endpoints
Health Check
GET /health
Get Quote
GET /quote?ticker=AAPL
Example:
curl "https://market-snapshot-api.onrender.com/quote?ticker=AAPL" \
  -H "x-api-key: YOUR_API_KEY"
Response:
{
  "success": true,
  "data": {
    "ticker": "AAPL",
    "price": 255.92,
    "open": 254.2,
    "high": 256.13,
    "low": 250.65,
    "previousClose": 255.63,
    "change": 0.29,
    "changePct": "0.11%",
    "volume": 31289400,
    "latestTradingDay": "2026-04-02"
  }
}
Watchlist (Multiple Tickers)
GET /watchlist?tickers=AAPL,MSFT,TSLA
Example:
curl "https://market-snapshot-api.onrender.com/watchlist?tickers=AAPL,MSFT,TSLA" \
  -H "x-api-key: YOUR_API_KEY"
Account Info
GET /me
Example:
curl https://market-snapshot-api.onrender.com/me \
  -H "x-api-key: YOUR_API_KEY"
🔑 Admin Endpoints
Create API Key
POST /admin/create-key
Example:
curl -X POST https://market-snapshot-api.onrender.com/admin/create-key \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: YOUR_ADMIN_SECRET" \
  -d '{"plan":"free"}'
⚙️ Environment Variables
MARKET_API_KEY=your_twelve_data_api_key
ADMIN_SECRET=your_admin_secret
RATE_LIMIT_RPM=60
🧠 Architecture
Backend: Node.js (Express)
Database: PostgreSQL (Render)
ORM: Prisma
Market Data Provider: Twelve Data
Hosting: Render
Caching: In-memory TTL cache
⚡ Rate Limits
Default: 60 requests per minute per API key
Controlled via RATE_LIMIT_RPM
🧪 Local Development
npm install
npm run dev
📦 Deployment

This project is deployed using Render Blueprints.

💰 Use Cases
Trading dashboards
Financial apps
Stock tracking tools
SaaS APIs
Developer integrations
⚠️ Notes
Data is sourced from Twelve Data
Free tier usage depends on upstream provider limits
Cached responses reduce API usage and improve speed
📜 License

MIT

🙌 Author

Built as a production-ready financial data API.
