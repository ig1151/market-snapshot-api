"use strict";

const TICKER_RE = /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/;

function validateTicker(ticker) {
  if (!ticker) return "ticker is required";
  if (!TICKER_RE.test(ticker)) {
    return `"${ticker}" is not a valid ticker symbol (1-5 uppercase letters, optional .XX suffix)`;
  }
  return null;
}

module.exports = { validateTicker };
