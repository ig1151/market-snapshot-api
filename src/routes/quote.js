"use strict";
/**
 * @swagger
 * /quote:
 *   get:
 *     summary: Get a real-time stock quote
 *     tags: [Quotes]
 *     parameters:
 *       - in: query
 *         name: ticker
 *         required: true
 *         schema:
 *           type: string
 *         example: AAPL
 *         description: Stock ticker symbol (e.g. AAPL, MSFT, TSLA)
 *     responses:
 *       200:
 *         description: Real-time quote data
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

const TTL = 60;

router.get("/", async (req, res, next) => {
  try {
    const ticker = (req.query.ticker || "").toUpperCase().trim();
    const err = validateTicker(ticker);
    if (err) return fail(res, 400, err);

    const cacheKey = `quote:${ticker}`;
    const cached = getCache(cacheKey);
    if (cached) return send(res, 200, cached, { cached: true, ttl: TTL });

    const data = await getQuote(ticker);
    setCache(cacheKey, data, TTL);
    return send(res, 200, data, { cached: false, ttl: TTL });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
