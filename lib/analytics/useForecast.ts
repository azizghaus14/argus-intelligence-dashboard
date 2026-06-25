"use client";

import { useMemo } from "react";
import { useCryptoHistory, useCryptoNews, useMarkets } from "@/lib/hooks/useFeeds";
import { analyzeSentiment, type SentimentResult } from "./sentiment";
import { forecastAsset, type AssetForecast } from "./forecast";

export interface ForecastBundle {
  assets: AssetForecast[];
  sentiment: SentimentResult;
  live: boolean;
  loading: boolean;
}

// Combines hourly price history with the news-sentiment feature to produce a
// per-asset 24h forecast. Sentiment is computed once and applied to every coin
// (crypto headlines move the whole market risk-on/risk-off).
export function useForecast(): ForecastBundle {
  const history = useCryptoHistory();
  const news = useCryptoNews();
  const markets = useMarkets();

  return useMemo(() => {
    const series = history.data?.data ?? [];
    const headlines = news.data?.data ?? [];
    const ticks = markets.data?.data ?? [];

    const sentiment = analyzeSentiment(headlines);
    const spotByLabel = new Map(ticks.map((t) => [t.label, t.value]));

    const assets = series
      .map((s) => forecastAsset(s.label, s.prices, sentiment.index, spotByLabel.get(s.label)))
      .filter((a): a is AssetForecast => a !== null);

    const live = !!(history.data?.meta.live || markets.data?.meta.live);
    const loading = !history.data && !history.error;

    return { assets, sentiment, live, loading };
  }, [history.data, history.error, news.data, markets.data]);
}
