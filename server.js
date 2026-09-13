const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;
const API_KEY = process.env.TWELVE_DATA_API_KEY;

app.use(express.static(path.join(__dirname)));

const intervalMap = {
  "1m": "1min",
  "5m": "5min",
  "15m": "15min",
  "30m": "30min",
  "1h": "1h",
  "4h": "4h",
  "1d": "1day"
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/config", (req, res) => {
  res.json({
    configured: Boolean(API_KEY),
    td: Boolean(API_KEY),
    te: false,
    av: false
  });
});

app.get("/api/candles", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({
        configured: false,
        error: "TWELVE_DATA_API_KEY is not configured in Render."
      });
    }

    const requested = req.query.interval || "5m";
    const interval = intervalMap[requested];

    if (!interval) {
      return res.status(400).json({
        configured: false,
        error: "Unsupported timeframe."
      });
    }

    const url = new URL("https://api.twelvedata.com/time_series");
    url.searchParams.set("symbol", "XAU/USD");
    url.searchParams.set("interval", interval);
    url.searchParams.set("outputsize", "120");
    url.searchParams.set("apikey", API_KEY);

    const response = await fetch(url);
    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        configured: false,
        error: "Twelve Data returned an invalid response."
      });
    }

    if (data.status !== "ok" || !Array.isArray(data.values)) {
      return res.status(502).json({
        configured: false,
        error: data.message || "Twelve Data did not return candle data."
      });
    }

    res.json({
      configured: true,
      symbol: "XAU/USD",
      interval: requested,
      values: data.values
    });

  } catch (error) {
    res.status(500).json({
      configured: false,
      error: "Market data connection failed."
    });
  }
});

app.get("/api/calendar", (req, res) => {
  res.json({
    events: [],
    configured: false
  });
});

app.get("/api/news", (req, res) => {
  res.json({
    items: [],
    configured: false
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Oderinde Gold Intelligence running on port ${PORT}`);
});
