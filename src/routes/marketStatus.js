"use strict";
/**
 * @swagger
 * /market-status:
 *   get:
 *     summary: Get open/closed status for major global exchanges
 *     tags: [Markets]
 *     responses:
 *       200:
 *         description: List of exchanges with open/closed status
 *       401:
 *         description: Invalid or missing API key
 *       429:
 *         description: Rate limit exceeded
 */
const router = require("express").Router();
const { getMarketStatus } = require("../services/marketService");
const { getCache, setCache } = require("../utils/cache");
const { send } = require("../utils/response");

const TTL = 300;

router.get("/", async (_req, res, next) => {
  try {
    const cacheKey = "market-status";
    const cached = getCache(cacheKey);
    if (cached) return send(res, 200, cached, { cached: true, ttl: TTL });

    const data = await getMarketStatus();
    setCache(cacheKey, data, TTL);
    return send(res, 200, data, { cached: false, ttl: TTL });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
