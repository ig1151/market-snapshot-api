"use strict";
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check if the API is online
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: API is healthy
 */
const router = require("express").Router();
const { send } = require("../utils/response");

router.get("/", (_req, res) => {
  send(res, 200, { status: "ok", uptime: process.uptime() }, { service: "market-snapshot-api" });
});

module.exports = router;
