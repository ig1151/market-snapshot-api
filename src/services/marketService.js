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

async function getChart(ticker, interval = "1day", periods = 30) {
  const validIntervals = ["1min","5min","15min","30min","1h","2h","4h","1day","1week","1month"];
  if (!validIntervals.includes(interval)) throw new Error(`Invalid interval. Use one of: ${validIntervals.join(", ")}`);
  const outputSize = Math.min(Math.max(parseInt(periods), 1), 365);
  const d = await get(`/time_series?symbol=${ticker}&interval=${interval}&outputsize=${outputSize}`);
  if (d.status === "error" || d.code) throw new Error(d.message || "Ticker not found");
  const values = d.values ?? [];
  return {
    ticker: d.meta?.symbol ?? ticker,
    interval,
    periods: values.length,
    data: values.map(v => ({
      datetime: v.datetime,
      open: parseFloat(v.open),
      high: parseFloat(v.high),
      low: parseFloat(v.low),
      close: parseFloat(v.close),
      volume: parseInt(v.volume),
    })),
  };
}
async function searchTickers(query) {
  const d = await get(`/symbol_search?symbol=${encodeURIComponent(query)}`);
  if (d.status === "error" || d.code) throw new Error(d.message || "Search failed");
  const results = d.data ?? [];
  return results
    .filter(r => r.instrument_type === "Common Stock")
    .slice(0, 10)
    .map(r => ({
      symbol: r.symbol,
      name: r.instrument_name,
      exchange: r.exchange,
      country: r.country,
      currency: r.currency,
      type: r.instrument_type,
    }));
}
async function getFundamentals(ticker) {
  const d = await get(`/statistics?symbol=${ticker}`);
  if (d.status === "error" || d.code) throw new Error(d.message || "Ticker not found");
  const s = d.statistics;
  return {
    ticker: d.meta?.symbol ?? ticker,
    name: d.meta?.name,
    exchange: d.meta?.exchange,
    currency: d.meta?.currency,
    valuation: {
      market_cap: s.valuations_metrics?.market_capitalization,
      enterprise_value: s.valuations_metrics?.enterprise_value,
      pe_ratio: s.valuations_metrics?.trailing_pe,
      forward_pe: s.valuations_metrics?.forward_pe,
      peg_ratio: s.valuations_metrics?.peg_ratio,
      price_to_sales: s.valuations_metrics?.price_to_sales_ttm,
      price_to_book: s.valuations_metrics?.price_to_book_mrq,
    },
    financials: {
      revenue_ttm: s.financials?.income_statement?.revenue_ttm,
      gross_profit_ttm: s.financials?.income_statement?.gross_profit_ttm,
      net_income_ttm: s.financials?.income_statement?.net_income_to_common_ttm,
      eps_ttm: s.financials?.income_statement?.diluted_eps_ttm,
      profit_margin: s.financials?.profit_margin,
      operating_margin: s.financials?.operating_margin,
      return_on_equity: s.financials?.return_on_equity_ttm,
      operating_cash_flow: s.financials?.cash_flow?.operating_cash_flow_ttm,
    },
    price_summary: {
      fifty_two_week_high: s.stock_price_summary?.fifty_two_week_high,
      fifty_two_week_low: s.stock_price_summary?.fifty_two_week_low,
      fifty_two_week_change: s.stock_price_summary?.fifty_two_week_change,
      beta: s.stock_price_summary?.beta,
      day_50_ma: s.stock_price_summary?.day_50_ma,
      day_200_ma: s.stock_price_summary?.day_200_ma,
    },
    dividends: {
      forward_dividend_rate: s.dividends_and_splits?.forward_annual_dividend_rate,
      forward_dividend_yield: s.dividends_and_splits?.forward_annual_dividend_yield,
      payout_ratio: s.dividends_and_splits?.payout_ratio,
      ex_dividend_date: s.dividends_and_splits?.ex_dividend_date,
    },
    shares: {
      shares_outstanding: s.stock_statistics?.shares_outstanding,
      float_shares: s.stock_statistics?.float_shares,
      institutional_ownership: s.stock_statistics?.percent_held_by_institutions,
      insider_ownership: s.stock_statistics?.percent_held_by_insiders,
    },
  };
}
module.exports = { getQuote, getWatchlist, getMarketStatus, getChart, searchTickers, getFundamentals };