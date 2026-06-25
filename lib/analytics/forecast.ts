// Crypto price forecast: time-series momentum + volatility, nudged by the
// engineered news-sentiment feature. Produces a forward path with an 80%
// confidence band and a transparent driver breakdown.
//
//   forecast_h = spot · exp(drift · h)
//   band_h     = spot · exp(drift · h  ±  z · σ · √h)        (random-walk band)
//   drift      = 0.5 · EWMA(log-returns)  +  k · sentiment · σ
//
// The √h band widening is the standard random-walk uncertainty cone; the
// sentiment term is what makes "news moves crypto" show up in the numbers.

export interface ForecastPoint {
  t: number;
  mid: number;
  lo: number;
  hi: number;
}

export interface AssetForecast {
  label: string;
  spot: number;
  history: [number, number][]; // downsampled actuals for plotting
  forecast: ForecastPoint[];
  horizonH: number;
  expectedChangePct: number;
  volatilityPct: number; // hourly volatility, %
  momentum: "up" | "down" | "flat";
  sentiment: number; // -1..1, the news feature applied
  drivers: string[];
}

const Z80 = 1.282; // 80% two-sided normal quantile
const SENT_K = 0.18; // sentiment → drift coupling (in σ units)
const DRIFT_DAMP = 0.5; // shrink raw momentum toward 0 (anti-overfit)
const EWMA_ALPHA = 0.12; // smoothing for the return series

function logReturns(prices: number[]): number[] {
  const r: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0 && prices[i] > 0) r.push(Math.log(prices[i] / prices[i - 1]));
  }
  return r;
}

function ewma(xs: number[], alpha: number): number {
  if (xs.length === 0) return 0;
  let m = xs[0];
  for (let i = 1; i < xs.length; i++) m = alpha * xs[i] + (1 - alpha) * m;
  return m;
}

function std(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v);
}

function downsample(prices: [number, number][], target: number): [number, number][] {
  if (prices.length <= target) return prices;
  const step = prices.length / target;
  const out: [number, number][] = [];
  for (let i = 0; i < target; i++) out.push(prices[Math.floor(i * step)]);
  out.push(prices[prices.length - 1]);
  return out;
}

export function forecastAsset(
  label: string,
  series: [number, number][],
  sentiment: number,
  spotOverride?: number,
  horizonH = 24
): AssetForecast | null {
  if (!series || series.length < 24) return null;
  const sorted = [...series].sort((a, b) => a[0] - b[0]);
  const prices = sorted.map((p) => p[1]);
  const spot = spotOverride && spotOverride > 0 ? spotOverride : prices[prices.length - 1];
  const lastT = sorted[sorted.length - 1][0];

  const rets = logReturns(prices);
  const recent = rets.slice(-72); // ~3 days of hourly returns
  const momentumRaw = ewma(recent.slice(-48), EWMA_ALPHA);
  const vol = std(recent) || 0.005;

  const sentAdj = SENT_K * sentiment * vol;
  const drift = DRIFT_DAMP * momentumRaw + sentAdj;

  const stepMs = 3.6e6; // 1h
  const forecast: ForecastPoint[] = [];
  for (let h = 1; h <= horizonH; h++) {
    const mid = spot * Math.exp(drift * h);
    const band = Z80 * vol * Math.sqrt(h);
    forecast.push({
      t: lastT + h * stepMs,
      mid,
      lo: spot * Math.exp(drift * h - band),
      hi: spot * Math.exp(drift * h + band),
    });
  }

  const expectedChangePct = (forecast[forecast.length - 1].mid / spot - 1) * 100;
  const momentum: AssetForecast["momentum"] =
    momentumRaw > 0.0008 ? "up" : momentumRaw < -0.0008 ? "down" : "flat";

  const drivers: string[] = [];
  drivers.push(
    momentum === "flat"
      ? "Momentum: range-bound"
      : `Momentum: ${momentum === "up" ? "upward" : "downward"} trend`
  );
  if (Math.abs(sentiment) > 0.12) {
    drivers.push(
      `News: ${sentiment > 0 ? "bullish" : "bearish"} (${sentiment >= 0 ? "+" : ""}${sentiment.toFixed(
        2
      )})`
    );
  } else {
    drivers.push("News: neutral");
  }
  drivers.push(`Volatility: ${(vol * 100).toFixed(2)}%/h`);

  return {
    label,
    spot,
    history: downsample(sorted, 120),
    forecast,
    horizonH,
    expectedChangePct,
    volatilityPct: vol * 100,
    momentum,
    sentiment,
    drivers,
  };
}
