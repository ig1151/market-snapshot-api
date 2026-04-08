"use strict";
/**
 * @swagger
 * /watchlist:
 *   get:
 *     summary: Get quotes for multiple tickers
 *     tags: [Quotes]
 *     parameters:
 *       - in: query
 *         name: tickers
 *         required: true
 *         schema:
 *           type: string
 *         example: AAPL,MSFT,TSLA
 *         description: Comma-separated list of ticker symbols (max 20)
 *     responses:
 *       200:
 *         description: Array of real-time quotes
 *       400:
 *         description: Invalid ticker
 *       401:
 *         description: Invalid or missing API key
 *       429:
 *         description: Rate limit exceeded
 */
const router = require("express").Router();
const { getQuote } = require("../services/marketService");
const { validateTicker } = require("../utils/validate");
const { getCache, setCache } = require("../utils/cache");
const { send, fail } = require("../utils/response");

const MAX_TICKERS = 20;
const TTL = 60;

router.get("/", async (req, res, next) => {
  try {
    const raw = (req.query.tickers || "").toUpperCase().trim();
    if (!raw) return fail(res, 400, "tickers query param is required (comma-separated)");

    const tickers = [...new Set(raw.split(",").map((t) => t.trim()).filter(Boolean))];
    if (tickers.length > MAX_TICKERS) {
      return fail(res, 400, `Maximum ${MAX_TICKERS} tickers per request`);
    }

    for (const t of tickers) {
      const err = validateTicker(t);
      if (err) return fail(res, 400, `Invalid ticker "${t}": ${err}`);
    }

    const cacheKey = `watchlist:${[...tickers].sort().join(",")}`;
    const cached = getCache(cacheKey);
    if (cached) return send(res, 200, cached, { cached: true, ttl: TTL, count: cached.length });

    const results = await Promise.all(
      tickers.map((t) => getQuote(t).catch((e) => ({ ticker: t, error: e.message })))
    );
    setCache(cacheKey, results, TTL);
    return send(res, 200, results, { cached: false, ttl: TTL, count: results.length });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
