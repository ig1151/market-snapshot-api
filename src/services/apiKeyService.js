"use strict";
const crypto = require("crypto");
const prisma = require("../db/client");

const VALID_PLANS = ["free", "pro"];

function generateKey() {
  return `msa_${crypto.randomBytes(16).toString("hex")}`;
}

async function createApiKey(plan = "free") {
  if (!VALID_PLANS.includes(plan)) {
    const err = new Error(`Invalid plan "${plan}". Valid options: ${VALID_PLANS.join(", ")}`);
    err.status = 400;
    throw err;
  }
  const key = generateKey();
  return prisma.apiKey.create({ data: { key, plan } });
}

async function revokeApiKey(key) {
  const record = await prisma.apiKey.findUnique({ where: { key } });
  if (!record) {
    const err = new Error("API key not found");
    err.status = 404;
    throw err;
  }
  return prisma.apiKey.update({ where: { key }, data: { active: false } });
}

async function lookupApiKey(key) {
  return prisma.apiKey.findUnique({ where: { key } });
}

module.exports = { createApiKey, revokeApiKey, lookupApiKey };
