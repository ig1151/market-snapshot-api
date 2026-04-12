"use strict";
/**
 * @swagger
 * /fundamentals:
 *   get:
 *     summary: Get fundamental data for a ticker
 *     tags: [Fundamentals]
 *     parameters:
 *       - in: query
 *         name: ticker
 *         required: true
 *         schema:
 *           type: string
 *         example: AAPL
 *         description: Stock ticker symbol
 *     responses:
 *       200:
 *         description: Fundamental data including valuation, financials, dividends and ownership
 *       400:
 *         description: Invalid ticker
 *       429:
 *         description: Rate limit exceeded
 */
const router = require("express").Router();
const { getFundamentals } = require("../services/marketService");
const { validateTicker } = require("../utils/validate");
const { getCache, setCache } = require("../utils/cache");
const { send, fail } = require("../utils/response");

const TTL = 3600;

router.get("/", async (req, res, next) => {
  try {
    const ticker = (req.query.ticker || "").toUpperCase().trim();
    const err = validateTicker(ticker);
    if (err) return fail(res, 400, err);

    const cacheKey = `fundamentals:${ticker}`;
    const cached = getCache(cacheKey);
    if (cached) return send(res, 200, cached, { cached: true, ttl: TTL });

    const data = await getFundamentals(ticker);
    setCache(cacheKey, data, TTL);
    return send(res, 200, data, { cached: false, ttl: TTL });
  } catch (e) {
    next(e);
  }
});

module.exports = router;