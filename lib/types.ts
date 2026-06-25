export interface Flight {
  id: string; // icao24
  callsign: string;
  origin: string; // country
  lng: number;
  lat: number;
  alt: number; // meters
  baroAlt?: number | null; // meters
  geoAlt?: number | null; // meters
  velocity: number; // m/s
  heading: number; // deg
  verticalRate?: number | null; // m/s
  squawk?: string | null;
  lastContact?: number; // epoch ms
  timePosition?: number | null; // epoch ms
  positionSource?: string;
  category?: string;
  emergency?: boolean;
  stale?: boolean;
  onGround: boolean;
}

export interface Quake {
  id: string;
  mag: number;
  place: string;
  lng: number;
  lat: number;
  depth: number; // km
  time: number; // epoch ms
  url: string;
}

export interface SpaceAsset {
  id: string;
  name: string;
  lng: number;
  lat: number;
  alt: number; // km
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  link: string;
  published: number; // epoch ms
  category: string;
}

export interface FeedMeta {
  count: number;
  fetchedAt: number;
  source: string;
  live: boolean; // true = real upstream, false = degraded/sample
  status?: "live" | "cached" | "stale" | "rate-limited" | "offline";
  message?: string;
  upstreamTime?: number; // epoch ms
  cacheAgeMs?: number;
  refreshIntervalMs?: number;
  retryAfterSeconds?: number;
  authenticated?: boolean;
}

export interface FeedResponse<T> {
  data: T[];
  meta: FeedMeta;
}

export type LayerId =
  | "flights"
  | "military"
  | "quakes"
  | "space"
  | "events"
  | "flashpoints";
