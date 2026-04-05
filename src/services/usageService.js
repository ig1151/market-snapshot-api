"use strict";
const prisma = require("../db/client");

const PLAN_LIMITS = {
  free: 100,
  pro: 10000
};

function trackUsage(apiKeyId, endpoint) {
  prisma.usage
    .create({ data: { apiKeyId, endpoint } })
    .catch((err) => console.error("[usageService] track failed:", err.message));
}

async function getUsageToday(apiKeyId) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return prisma.usage.count({
    where: { apiKeyId, timestamp: { gte: since } }
  });
}

async function checkPlanLimit(apiKeyId, plan) {
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const used = await getUsageToday(apiKeyId);
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    withinLimit: used < limit
  };
}

module.exports = { trackUsage, getUsageToday, checkPlanLimit, PLAN_LIMITS };
