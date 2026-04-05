"use strict";
const router = require("express").Router();
const { createApiKey, revokeApiKey } = require("../services/apiKeyService");
const { send, fail } = require("../utils/response");

function checkAdminSecret(req, res) {
  const secret = (process.env.ADMIN_SECRET || "").trim();
  if (!secret) return true;
  if (req.headers["x-admin-secret"] !== secret) {
    fail(res, 401, "Invalid or missing x-admin-secret header");
    return false;
  }
  return true;
}

router.post("/create-key", async (req, res, next) => {
  if (!checkAdminSecret(req, res)) return;

  const { plan } = req.body || {};
  if (!plan) return fail(res, 400, 'Request body must include "plan": "free" | "pro"');

  try {
    const record = await createApiKey(plan);
    return send(
      res,
      200,
      {
        id: record.id,
        key: record.key,
        plan: record.plan,
        active: record.active,
        createdAt: record.createdAt
      },
      { warning: "Store this key securely - it will not be shown again." }
    );
  } catch (err) {
    next(err);
  }
});

router.post("/revoke-key", async (req, res, next) => {
  if (!checkAdminSecret(req, res)) return;

  const { key } = req.body || {};
  if (!key) return fail(res, 400, 'Request body must include "key"');

  try {
    const record = await revokeApiKey(key);
    return send(res, 200, {
      id: record.id,
      plan: record.plan,
      active: record.active
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
