"use strict";

const https = require("https");

const TD_BASE = "https://api.twelvedata.com";

/**
 * Small HTTPS JSON helper
 */
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let raw = "";

        res.on("data", (chunk) => {
          raw += chunk;
        });

        res.on("end", () => {
          try {
            resolve(JSON.parse(raw));
          } catch (_err) {
            reject(new Error("Failed to parse upstream response"));
          }
        });
      })
      .on("error", reject);
  });
}

function getApiKey() {
  return process.env.MARKET_API_KEY || "";
}

/**
 * Twelve Data error shape:
 * {
 *   code: 400,
 *   message: "...",
 *   status: "error"
 * }
 */
function handleTwelveDataError(json, ticker) {
  if (json && json.status === "error") {
    const message = json.message || "Upstream provider returned an error";
    const code = Number(json.code);

    const err = new Error(message);

    if (code === 400 || code === 404) {
      err.status = 404;
    } else if (code === 401 || code === 403) {
      err.status = 401;
    } else if (code === 429) {
      err.status = 429;
    } else {
      err.status = 502;
    }

    throw err;
  }

  if (!json || !json.symbol) {
    const err = new Error(`No data found for ticker "${ticker}"`);
    err.status = 404;
    throw err;
  }
}

function normalizeQuote(q, requestedTicker) {
  return {
    ticker: q.symbol || requestedTicker,
    price: q.close != null ? parseFloat(q.close) : null,
    open: q.open != null ? parseFloat(q.open) : null,
    high: q.high != null ? parseFloat(q.high) : null,
    low: q.low != null ? parseFloat(q.low) : null,
    previousClose: q.previous_close != null ? parseFloat(q.previous_close) : null,
    change: q.change != null ? parseFloat(q.change) : null,
    changePct: q.percent_change != null ? `${q.percent_change}%` : null,
    volume: q.volume != null ? parseInt(q.volume, 10) : null,
    latestTradingDay: q.datetime || null,
  };
}

async function getQuote(ticker) {
  const apiKey = getApiKey();

  if (!apiKey) {
    const err = new Error("MARKET_API_KEY is not configured");
    err.status = 500;
    throw err;
  }

  const url = `${TD_BASE}/quote?symbol=${encodeURIComponent(ticker)}&apikey=${encodeURIComponent(apiKey)}`;
  const json = await httpGet(url);

  handleTwelveDataError(json, ticker);

  return normalizeQuote(json, ticker);
}

/**
 * Placeholder for now so the existing route does not break.
 */
async function getMarketStatus() {
  return {
    provider: "Twelve Data",
    status: "not implemented",
    message: "Market status is not implemented for Twelve Data in this version.",
    asOf: new Date().toISOString(),
  };
}

module.exports = { getQuote, getMarketStatus };
