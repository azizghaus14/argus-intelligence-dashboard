# ARGUS — Real-Time Intelligence Dashboard

A cinematic, spy-terminal situational-awareness dashboard built around a live 3D globe —
worldwide, real-time, and **keyless out of the box**. Add an Anthropic key to unlock an
**AI-synthesized daily intelligence brief**.

Frosted-glass deep-navy UI, a spinning Cesium globe with a soft atmospheric glow, and a
fixed dock of live data modules.

## Features

- **3D globe** — CesiumJS, oblique auto-rotating view with a soft glowing atmosphere;
  keyless Esri satellite imagery (optional Google Photorealistic 3D Tiles).
- **Live layers** — global flights, M4.5+ seismic, orbital assets, and an OSINT news wire.
- **SENTINEL analytics** — real-time flight **anomaly detection** (emergency squawks,
  robust z-score velocity/altitude outliers, circling/loitering) and a **news-driven
  crypto forecast** (finance-lexicon sentiment × price momentum, with a confidence cone).
- **AI Daily Brief** — Claude synthesizes today's signals into an executive brief:
  ranked summary, market analysis, business signals, things to watch, an opportunity
  matrix, and a 30-day probability matrix. Generated **once per day** and cached.

## Data sources (all keyless)

| Layer       | Source                                   | Refresh |
| ----------- | ---------------------------------------- | ------- |
| Air traffic | OpenSky `/states/all` (anon or OAuth)    | quota-aware |
| Seismic     | USGS GeoJSON                             | 60 s    |
| OSINT wire  | BBC / Al Jazeera / CNN / NPR RSS         | 120 s   |
| Crypto      | Binance klines + CoinGecko + crypto RSS  | 5 min   |

All feeds are proxied server-side with a TTL cache + graceful stale-serve, so the demo
always renders even if an upstream is rate-limited.

## Tech

Next.js 14 (App Router) · TypeScript · Tailwind · Zustand · SWR · CesiumJS · Anthropic SDK.

## Run locally

```bash
npm install
cp .env.example .env   # fill in keys you have (all optional except the AI brief)
npm run dev            # http://localhost:3000
```

Everything works keyless. The **Daily Brief** falls back to a live-derived (non-AI)
analysis until you add `ANTHROPIC_API_KEY`.

## Environment variables

All optional. See `.env.example` for the full list.

| Var | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Enables the AI Daily Brief ([console.anthropic.com](https://console.anthropic.com)). |
| `ANTHROPIC_MODEL` | Override model (default `claude-opus-4-8`; `claude-haiku-4-5` is cheaper). |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Persistent daily-brief cache (Vercel KV / Upstash). |
| `CRON_SECRET` | Locks brief generation to the daily cron (set in production). |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional Google 3D Tiles (else keyless Esri). |
| `OPENSKY_CLIENT_ID` / `OPENSKY_CLIENT_SECRET` | Higher flight-feed headroom. |

> **Never commit `.env`** — it's gitignored. In production, set these in your host's
> Environment Variables settings.

## Deploy to Vercel

1. Push this repo to GitHub and **Import** it in Vercel.
2. In **Project → Settings → Environment Variables**, add `ANTHROPIC_API_KEY` and a random
   `CRON_SECRET`.
3. (Recommended) Add the **Upstash for Redis** integration from the Vercel Marketplace — it
   auto-injects `KV_REST_API_URL` / `KV_REST_API_TOKEN` so the brief persists across cold
   starts.
4. Deploy. `vercel.json` registers a daily cron (`06:00 UTC`) that regenerates the brief
   **once per day** — visitors only ever read the cache, so the AI cost is ~a few cents/day
   regardless of traffic.

## Cost

Hosting, globe, and all live feeds are **free**. The only recurring cost is the AI brief —
**~$5–6/month on Opus** (once-daily, cached) or **~$1/month on Haiku**. Keep Google 3D
Tiles off for a public deploy to avoid per-tile billing (keyless Esri is the default).
