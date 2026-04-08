"use strict";
const https = require("https");

const BASE = "https://api.twelvedata.com";
const KEY  = () => process.env.TWELVE_DATA_API_KEY || "";

function get(path) {
  return new Promise((resolve, reject) => {
    https.get(`${BASE}${path}&apikey=${KEY()}`, res => {
      let raw = "";
      res.on("data", c => raw += c);
      res.on("end", () => {
        try { resolve(JSON.parse(raw)); }
        catch { reject(new Error("Invalid JSON from Twelve Data")); }
      });
    }).on("error", reject);
  });
}

async function getQuote(ticker) {
  const d = await get(`/quote?symbol=${ticker}`);
  if (d.status === "error" || d.code) throw new Error(d.message || "Ticker not found");
  return {
    ticker:           d.symbol,
    name:             d.name,
    exchange:         d.exchange,
    price:            parseFloat(d.close),
    open:             parseFloat(d.open),
    high:             parseFloat(d.high),
    low:              parseFloat(d.low),
    previousClose:    parseFloat(d.previous_close),
    change:           parseFloat(d.change),
    changePct:        d.percent_change + "%",
    volume:           parseInt(d.volume),
    latestTradingDay: d.datetime,
    isMarketOpen:     d.is_market_open,
  };
}

async function getWatchlist(tickers) {
  const symbols = tickers.slice(0, 20).join(",");
  const d = await get(`/quote?symbol=${symbols}`);
  const entries = tickers.length === 1
    ? [[tickers[0], d]]
    : Object.entries(d);
  return entries
    .filter(([, v]) => v && !v.code)
    .map(([, v]) => ({
      ticker:       v.symbol,
      name:         v.name,
      price:        parseFloat(v.close),
      change:       parseFloat(v.change),
      changePct:    v.percent_change + "%",
      isMarketOpen: v.is_market_open,
    }));
}

async function getMarketStatus() {
  const d = await get(`/market_state?`);
  const markets = Array.isArray(d) ? d : [d];
  const major = ["NASDAQ", "NYSE", "LSE", "TSX", "EUREX", "ASX"];
  return markets
    .filter(m => major.includes(m.name) || major.includes(m.code))
    .map(m => ({
      exchange:      m.code,
      name:          m.name,
      country:       m.country,
      timeToOpen:    m.time_to_open,
      timeToClose:   m.time_to_close,
      currentStatus: m.is_market_open ? "open" : "closed",
    }));
}

module.exports = { getQuote, getWatchlist, getMarketStatus };