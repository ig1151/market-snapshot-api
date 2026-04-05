"use strict";
const router = require("express").Router();
const { checkPlanLimit } = require("../services/usageService");
const { send } = require("../utils/response");

router.get("/", async (req, res, next) => {
  try {
    const { id, key, plan, createdAt } = req.apiKey;
    const { used, limit, remaining } = await checkPlanLimit(id, plan);

    return send(res, 200, {
      key: `${key.slice(0, 12)}...`,
      plan,
      createdAt,
      usage: {
        today: used,
        limit,
        remaining,
        windowHrs: 24
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
