"use strict";
const { checkPlanLimit, trackUsage } = require("../services/usageService");
const { fail } = require("../utils/response");

async function planLimiter(req, res, next) {
  const { id: apiKeyId, plan } = req.apiKey;

  try {
    const { withinLimit, used, limit } = await checkPlanLimit(apiKeyId, plan);

    if (!withinLimit) {
      return fail(
        res,
        429,
        `Daily limit of ${limit} requests reached for the "${plan}" plan. Upgrade to increase your limit.`
      );
    }

    trackUsage(apiKeyId, req.path);

    res.setHeader("X-RateLimit-Plan", plan);
    res.setHeader("X-RateLimit-Limit", String(limit));
    res.setHeader("X-RateLimit-Used", String(used + 1));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, limit - used - 1)));

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { planLimiter };
