"use strict";
const router = require("express").Router();
const { send } = require("../utils/response");

router.get("/", (_req, res) => {
  send(res, 200, { status: "ok", uptime: process.uptime() }, { service: "market-snapshot-api" });
});

module.exports = router;
