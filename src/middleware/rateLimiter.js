"use strict";
const rateLimit = require("express-rate-limit");
const { fail } = require("../utils/response");

const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_RPM || "60", 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => fail(res, 429, "Rate limit exceeded - slow down")
});

module.exports = { rateLimiter };
