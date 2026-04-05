"use strict";

const https = require("https");

const BASE = "https://www.alphavantage.co/query";
const AV_KEY = () => process.env.MARKET_API_KEY || "demo";

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let raw = "";
      res.on("data", (d) => (raw += d));
      res.on("end", () => {
        try {
          resolve(JSON.parse(raw));
        } catch {
          reject(new Error("Failed to parse upstream response"));
        }
      });
    }).on("error", reject);
  });
}

async function getQuote(ticker) {
  const url = `${BASE}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(ticker)}&apikey=${AV_KEY()}`;
  const json = await httpGet(url);

  if (json["Note"] || json["Information"]) {
    const err = new Error("Upstream rate limit reached - try again shortly");
    err.status = 429;
    throw err;
  }

  const q = json["Global Quote"];
  if (!q || !q["01. symbol"]) {
    const err = new Error(`No data found for ticker "${ticker}"`);
    err.status = 404;
    throw err;
  }

  return normalizeQuote(q);
}

function normalizeQuote(q) {
  return {
    ticker: q["01. symbol"],
    price: parseFloat(q["05. price"]),
    open: parseFloat(q["02. open"]),
    high: parseFloat(q["03. high"]),
    low: parseFloat(q["04. low"]),
    previousClose: parseFloat(q["08. previous close"]),
    change: parseFloat(q["09. change"]),
    changePct: q["10. change percent"],
    volume: parseInt(q["06. volume"], 10),
    latestTradingDay: q["07. latest trading day"]
  };
}

async function getMarketStatus() {
  const url = `${BASE}?function=MARKET_STATUS&apikey=${AV_KEY()}`;
  const json = await httpGet(url);

  if (json["Note"] || json["Information"]) {
    const err = new Error("Upstream rate limit reached - try again shortly");
    err.status = 429;
    throw err;
  }

  const markets = (json.markets || []).map((m) => ({
    type: m.market_type,
    region: m.region,
    primaryExchanges: m.primary_exchanges,
    localOpen: m.local_open,
    localClose: m.local_close,
    currentStatus: m.current_status,
    notes: m.notes || null
  }));

  return { markets, asOf: new Date().toISOString() };
}

module.exports = { getQuote, getMarketStatus };
