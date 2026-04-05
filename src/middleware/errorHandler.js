"use strict";
const { fail } = require("../utils/response");

function notFound(_req, res) {
  return fail(res, 404, "Route not found");
}

function errorHandler(err, _req, res, _next) {
  console.error("[error]", err.message);
  const status = err.status || 500;
  const msg = status < 500 ? err.message : "Internal server error";
  return fail(res, status, msg);
}

module.exports = { notFound, errorHandler };
