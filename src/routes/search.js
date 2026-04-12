"use strict";
/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search for tickers by company name or symbol
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: apple
 *         description: Company name or partial ticker symbol
 *     responses:
 *       200:
 *         description: List of matching tickers
 *       400:
 *         description: Missing search query
 *       429:
 *         description: Rate limit exceeded
 */
const router = require("express").Router();
const { searchTickers } = require("../services/marketService");
const { getCache, setCache } = require("../utils/cache");
const { send, fail } = require("../utils/response");

const TTL = 3600;

router.get("/", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return fail(res, 400, "q parameter is required — provide a company name or ticker symbol");
    if (q.length < 2) return fail(res, 400, "q must be at least 2 characters");

    const cacheKey = `search:${q.toLowerCase()}`;
    const cached = getCache(cacheKey);
    if (cached) return send(res, 200, cached, { cached: true, ttl: TTL });

    const data = await searchTickers(q);
    setCache(cacheKey, data, TTL);
    return send(res, 200, data, { cached: false, ttl: TTL });
  } catch (e) {
    next(e);
  }
});

module.exports = router;