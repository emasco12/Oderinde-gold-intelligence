ODERINDE GOLD INTELLIGENCE — PROFESSIONAL BUILD

This package upgrades the original browser-only prototype into a real provider-backed architecture.

WHAT IS INCLUDED
- Professional XAU/USD intelligence dashboard
- Secure server-side provider proxy (server.js)
- Multi-timeframe candle retrieval: 1m, 5m, 15m, 30m, 1h, 4h, 1d
- Liquidity-first deterministic analysis: mapped highs/lows, sweep detection, structure, displacement, momentum
- Calculated Entry / Invalidation / TP1 / TP2 / TP3 / R:R when all gates are available
- Economic calendar gate
- Market-news sentiment gate
- No forced signal: WAIT when conditions or data are insufficient
- API keys kept server-side, not in browser JavaScript

REAL DATA PROVIDERS
1. Twelve Data: XAU/USD real-time/historical market data and streaming capabilities.
2. Trading Economics: economic calendar and macro/market data.
3. Alpha Vantage: market news and sentiment plus gold/commodity data.

SETUP
1. Install Node.js 18+.
2. Copy .env.example to .env (or configure environment variables in your host).
3. Add provider API keys:
   TWELVE_DATA_API_KEY=...
   ALPHA_VANTAGE_API_KEY=...
   TRADING_ECONOMICS_API_KEY=...
4. Run: node server.js
5. Open: http://localhost:8080

DEPLOYMENT
Use a Node-capable host such as Render, Railway, Fly.io, a VPS, or another platform that supports a Node server. Set the three environment variables in the host dashboard. Do not commit .env or expose paid API keys in client-side JavaScript.

IMPORTANT
The intelligence engine is deterministic and transparent, but it is not a guaranteed-profit system. Liquidity detection is algorithmic and should be validated against the exact feed/broker convention you intend to trade. The production strategy should be backtested and forward-tested before real-money use.

CURRENT LIMITATION
Provider keys are intentionally not included. Without them the dashboard will show a data-configuration gate instead of pretending that live candle/news/fundamental data exists. This is deliberate professional behavior.
