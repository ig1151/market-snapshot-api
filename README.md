# 📈 Market Snapshot API

A production-ready REST API for real-time stock data, watchlists, and global market status — built for fintech apps, dashboards, and AI agents.

## Features

- Real-time stock quotes
- Batch watchlist endpoint
- Global market status
- API key authentication
- Usage tracking per key
- Plan-based rate limiting
- Clean JSON responses
- Deploy-ready for Render + PostgreSQL

## Endpoints

### Public
- `GET /`
- `GET /health`

### Auth Required (`x-api-key`)
- `GET /quote?ticker=AAPL`
- `GET /watchlist?tickers=AAPL,MSFT`
- `GET /market-status`
- `GET /me`

### Admin
- `POST /admin/create-key`
- `POST /admin/revoke-key`

## Quick Start

```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Example Requests

```bash
curl http://localhost:3000/health

curl -X POST http://localhost:3000/admin/create-key \
  -H "Content-Type: application/json" \
  -d '{"plan":"free"}'

curl "http://localhost:3000/quote?ticker=IBM" \
  -H "x-api-key: YOUR_KEY"

curl "http://localhost:3000/me" \
  -H "x-api-key: YOUR_KEY"
```

## Deployment

Use Render Blueprint deployment with the included `render.yaml`.

Required environment variables:
- `MARKET_API_KEY`
- `ADMIN_SECRET`

## Notes

This project uses Alpha Vantage by default. For larger scale, consider upgrading the upstream provider and replacing the in-memory cache with Redis.

## License

MIT
