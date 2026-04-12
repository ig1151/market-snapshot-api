"use strict";
/**
 * @swagger
 * /chart:
 *   get:
 *     summary: Get historical price data for a ticker
 *     tags: [Charts]
 *     parameters:
 *       - in: query
 *         name: ticker
 *         required: true
 *         schema:
 *           type: string
 *         example: AAPL
 *         description: Stock ticker symbol
 *       - in: query
 *         name: interval
 *         required: false
 *         schema:
 *           type: string
 *           enum: [1min,5min,15min,30min,1h,2h,4h,1day,1week,1month]
 *           default: 1day
 *         description: Time interval between data points
 *       - in: query
 *         name: periods
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Number of data points to return
 *     responses:
 *       200:
 *         description: Historical OHLCV data
 *       400:
 *         description: Invalid ticker or parameters
 *       429:
 *         description: Rate limit exceeded
 */
const router = require("express").Router();
const { getChart } = require("../services/marketService");
const { validateTicker } = require("../utils/validate");
const { getCache, setCache } = require("../utils/cache");
const { send, fail } = require("../utils/response");

const TTL = 300;

router.get("/", async (req, res, next) => {
  try {
    const ticker = (req.query.ticker || "").toUpperCase().trim();
    const interval = (req.query.interval || "1day").trim();
    const periods = parseInt(req.query.periods || "30", 10);

    const err = validateTicker(ticker);
    if (err) return fail(res, 400, err);

    if (isNaN(periods) || periods < 1 || periods > 365) {
      return fail(res, 400, "periods must be an integer between 1 and 365");
    }

    const cacheKey = `chart:${ticker}:${interval}:${periods}`;
    const cached = getCache(cacheKey);
    if (cached) return send(res, 200, cached, { cached: true, ttl: TTL });

    const data = await getChart(ticker, interval, periods);
    setCache(cacheKey, data, TTL);
    return send(res, 200, data, { cached: false, ttl: TTL });
  } catch (e) {
    next(e);
  }
});

module.exports = router;