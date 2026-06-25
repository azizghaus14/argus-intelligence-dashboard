"use client";

import useSWR from "swr";
import type { Flight, Quake, SpaceAsset, NewsItem, FeedResponse } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const opts = (refresh: number) => ({
  refreshInterval: refresh,
  revalidateOnFocus: false,
  dedupingInterval: refresh / 2,
  keepPreviousData: true,
});

export function useFlights(enabled: boolean) {
  return useSWR<FeedResponse<Flight>>(
    enabled ? "/api/flights" : null,
    fetcher,
    opts(15_000)
  );
}

export function useMilitary(enabled: boolean) {
  return useSWR<FeedResponse<Flight>>(
    enabled ? "/api/adsb" : null,
    fetcher,
    opts(20_000)
  );
}

export function useQuakes(enabled: boolean) {
  return useSWR<FeedResponse<Quake>>(
    enabled ? "/api/quakes" : null,
    fetcher,
    opts(60_000)
  );
}

export function useSpace(enabled: boolean) {
  return useSWR<FeedResponse<SpaceAsset>>(
    enabled ? "/api/space" : null,
    fetcher,
    opts(20_000)
  );
}

export function useEvents() {
  return useSWR<FeedResponse<NewsItem>>("/api/events", fetcher, opts(120_000));
}

import type { MarketsResponse } from "@/app/api/markets/route";
export function useMarkets() {
  return useSWR<MarketsResponse>("/api/markets", fetcher, opts(60_000));
}

import type { CryptoHistoryResponse } from "@/app/api/crypto-history/route";
export function useCryptoHistory() {
  return useSWR<CryptoHistoryResponse>("/api/crypto-history", fetcher, opts(300_000));
}

export function useCryptoNews() {
  return useSWR<FeedResponse<NewsItem>>("/api/crypto-news", fetcher, opts(300_000));
}

import type { AiBriefResponse } from "@/app/api/brief-ai/route";
export function useAiBrief(enabled: boolean) {
  return useSWR<AiBriefResponse>(enabled ? "/api/brief-ai" : null, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 600_000,
    shouldRetryOnError: false,
  });
}
