const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 10000;

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

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


/* =========================
   CONFIGURATION
========================= */

app.get("/api/config", (req, res) => {

  res.json({
    configured: Boolean(TWELVE_DATA_API_KEY),
    td: Boolean(TWELVE_DATA_API_KEY),
    te: Boolean(FINNHUB_API_KEY),
    av: Boolean(FINNHUB_API_KEY)
  });

});


/* =========================
   TWELVE DATA CANDLES
========================= */

app.get("/api/candles", async (req, res) => {

  try {

    if (!TWELVE_DATA_API_KEY) {

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

    const url =
      new URL("https://api.twelvedata.com/time_series");

    url.searchParams.set("symbol", "XAU/USD");
    url.searchParams.set("interval", interval);
    url.searchParams.set("outputsize", "120");
    url.searchParams.set("apikey", TWELVE_DATA_API_KEY);

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

    if (
      data.status !== "ok" ||
      !Array.isArray(data.values)
    ) {

      return res.status(502).json({
        configured: false,
        error:
          data.message ||
          "Twelve Data did not return candle data."
      });

    }

    res.json({
      configured: true,
      symbol: "XAU/USD",
      interval: requested,
      values: data.values
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      configured: false,
      error: "Market data connection failed."
    });

  }

});


/* =========================
   FINNHUB NEWS
========================= */

app.get("/api/news", async (req, res) => {

  if (!FINNHUB_API_KEY) {

    return res.json({
      configured: false,
      items: []
    });

  }

  try {

    const url =
      new URL("https://finnhub.io/api/v1/news");

    url.searchParams.set("category", "general");
    url.searchParams.set("token", FINNHUB_API_KEY);

    const response = await fetch(url);

    const data = await response.json();

    if (!Array.isArray(data)) {

      return res.json({
        configured: false,
        items: []
      });

    }

    const items = data
      .slice(0, 30)
      .map(item => {

        const headline =
          String(item.headline || "");

        const text =
          headline.toLowerCase();

        let score = 0;

        const bullishWords = [
          "gold rises",
          "gold gains",
          "gold climbs",
          "gold rally",
          "safe haven",
          "dollar falls",
          "dollar weakens",
          "rate cut",
          "lower rates"
        ];

        const bearishWords = [
          "gold falls",
          "gold drops",
          "gold declines",
          "gold slides",
          "dollar rises",
          "dollar strengthens",
          "rate hike",
          "higher rates"
        ];

        bullishWords.forEach(word => {

          if (text.includes(word)) {
            score += 1;
          }

        });

        bearishWords.forEach(word => {

          if (text.includes(word)) {
            score -= 1;
          }

        });

        return {
          headline: headline,
          source: item.source || "",
          url: item.url || "",
          datetime: item.datetime || null,
          score: score
        };

      });

    res.json({
      configured: true,
      items
    });

  } catch (error) {

    console.error("Finnhub news error:", error);

    res.json({
      configured: false,
      items: []
    });

  }

});


/* =========================
   ECONOMIC CALENDAR
========================= */

app.get("/api/calendar", async (req, res) => {

  if (!FINNHUB_API_KEY) {

    return res.json({
      configured: false,
      events: []
    });

  }

  try {

    const now = new Date();

    const start =
      now.toISOString().slice(0, 10);

    const future =
      new Date(
        now.getTime() +
        7 * 24 * 60 * 60 * 1000
      );

    const end =
      future.toISOString().slice(0, 10);

    const url =
      new URL(
        "https://finnhub.io/api/v1/calendar/economic"
      );

    url.searchParams.set("from", start);
    url.searchParams.set("to", end);
    url.searchParams.set("token", FINNHUB_API_KEY);

    const response = await fetch(url);

    const data = await response.json();

    const rawEvents =
      Array.isArray(data)
        ? data
        : Array.isArray(data.economicCalendar)
          ? data.economicCalendar
          : [];

    const events =
      rawEvents
        .filter(event => {

          const country =
            String(event.country || "")
              .toUpperCase();

          return country === "US" ||
                 country === "USA";

        })
        .map(event => {

          let importance = 1;

          const impact =
            String(
              event.impact ||
              event.importance ||
              ""
            ).toLowerCase();

          if (
            impact.includes("high") ||
            impact === "3"
          ) {
            importance = 3;
          }

          else if (
            impact.includes("medium") ||
            impact === "2"
          ) {
            importance = 2;
          }

          return {
            event:
              event.event ||
              event.name ||
              "US Economic Event",

            country:
              event.country || "US",

            date:
              event.time ||
              event.date ||
              null,

            importance,

            actual:
              event.actual ?? null,

            estimate:
              event.estimate ?? null,

            previous:
              event.prev ??
              event.previous ??
              null
          };

        });

    res.json({
      configured: true,
      events
    });

  } catch (error) {

    console.error(
      "Finnhub calendar error:",
      error
    );

    res.json({
      configured: false,
      events: []
    });

  }

});


/* =========================
   START SERVER
========================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `Oderinde Gold Intelligence running on port ${PORT}`
    );

  }
);
