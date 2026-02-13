"use client";

import * as React from "react";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import { cn } from "@/lib/cn";

const DEFAULT_STYLE_URL = "/mapstyles/night-chart.json?v=2";
const SHIP_SOURCE_ID = "ships-live";
const SHIP_LAYER_ID = "ships-live-circles";
const EMPTY_FC: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };
const MAX_TILE_ZOOM = 6;
const MIN_TILE_ZOOM = 0;
const MAX_TILE_REQUESTS = 64;
const TILE_CONCURRENCY = 10;

export type MapViewProps = {
  className?: string;
  timeIso: string | null;
  rawWindowMinutes?: number;
};

function parseIntParam(value: unknown, fallback: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.trunc(value);
}

function lonToTile(lon: number, z: number) {
  const n = Math.pow(2, z);
  const x = Math.floor(((lon + 180) / 360) * n);
  return Math.min(n - 1, Math.max(0, x));
}

function latToTile(lat: number, z: number) {
  const clamped = Math.max(-85.0511, Math.min(85.0511, lat));
  const rad = (clamped * Math.PI) / 180;
  const n = Math.pow(2, z);
  const y = Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n
  );
  return Math.min(n - 1, Math.max(0, y));
}

function getTileRange(bounds: maplibregl.LngLatBoundsLike, z: number) {
  const b = maplibregl.LngLatBounds.convert(bounds);
  const minX = lonToTile(b.getWest(), z);
  const maxX = lonToTile(b.getEast(), z);
  const minY = latToTile(b.getNorth(), z);
  const maxY = latToTile(b.getSouth(), z);
  const tiles: Array<{ x: number; y: number; z: number }> = [];

  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      tiles.push({ x, y, z });
    }
  }

  return tiles;
}

function chooseTileZoom(bounds: maplibregl.LngLatBoundsLike, preferredZ: number) {
  let z = Math.min(MAX_TILE_ZOOM, Math.max(MIN_TILE_ZOOM, preferredZ));
  while (z > MIN_TILE_ZOOM) {
    if (getTileRange(bounds, z).length <= MAX_TILE_REQUESTS) return z;
    z -= 1;
  }
  return MIN_TILE_ZOOM;
}

async function pooledMap<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;

  const workers = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (i < items.length) {
      const idx = i;
      i += 1;
      out[idx] = await fn(items[idx] as T);
    }
  });

  await Promise.all(workers);
  return out;
}

export function MapView({ className, timeIso, rawWindowMinutes = 10 }: MapViewProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<MapLibreMap | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const refreshTimerRef = React.useRef<number | null>(null);
  const [mapError, setMapError] = React.useState<string | null>(null);

  const styleUrl =
    process.env.NEXT_PUBLIC_MAP_STYLE_URL?.trim() || DEFAULT_STYLE_URL;

  React.useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [-30, 25],
      zoom: 2.4,
      interactive: true,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-left");

    type MapErrorEvent = { error?: { message?: unknown } };
    const onError = (e: MapErrorEvent) => {
      const message =
        typeof e?.error?.message === "string" ? e.error.message : "Map error";
      setMapError(message);
    };
    map.on("error", onError);

    map.on("load", () => {
      if (!map.getSource(SHIP_SOURCE_ID)) {
        map.addSource(SHIP_SOURCE_ID, { type: "geojson", data: EMPTY_FC });
      }

      if (!map.getLayer(SHIP_LAYER_ID)) {
        map.addLayer({
          id: SHIP_LAYER_ID,
          type: "circle",
          source: SHIP_SOURCE_ID,
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 2.8, 5, 4.8, 8, 7.2, 11, 10.5],
            "circle-color": [
              "interpolate",
              ["linear"],
              ["coalesce", ["get", "sog"], 0],
              0,
              "rgba(181,241,255,0.96)",
              3,
              "rgba(146,223,255,0.97)",
              8,
              "rgba(255,221,130,0.98)",
              14,
              "rgba(255,163,112,0.99)",
              22,
              "rgba(231,81,104,1.0)",
            ],
            "circle-opacity": 0.95,
            "circle-stroke-color": "rgba(255,255,255,0.92)",
            "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 2, 0.8, 8, 1.4, 11, 1.8],
          },
        });
      }
    });

    mapRef.current = map;

    return () => {
      abortRef.current?.abort();
      map.off("error", onError);
      map.remove();
      mapRef.current = null;
    };
  }, [styleUrl]);

  const refreshLiveShips = React.useCallback(async () => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (!timeIso) {
      const source = map.getSource(SHIP_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
      source?.setData(EMPTY_FC);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const bounds = map.getBounds();
    const zoom = chooseTileZoom(bounds, parseIntParam(map.getZoom(), 3));
    const tiles = getTileRange(bounds, zoom);

    const fetchTile = async ({ x, y, z }: { x: number; y: number; z: number }) => {
      const url = new URL("/api/tiles", window.location.origin);
      url.searchParams.set("z", String(z));
      url.searchParams.set("x", String(x));
      url.searchParams.set("y", String(y));
      url.searchParams.set("time", timeIso);
      url.searchParams.set("rawWindowMinutes", String(rawWindowMinutes));

      const res = await fetch(url.toString(), { signal: controller.signal });
      if (!res.ok) return [] as GeoJSON.Feature[];

      const fc = (await res.json()) as GeoJSON.FeatureCollection;
      return (fc.features ?? []) as GeoJSON.Feature[];
    };

    let featureLists: GeoJSON.Feature[][] = [];
    try {
      featureLists = await pooledMap(tiles, TILE_CONCURRENCY, fetchTile);
    } catch {
      return;
    }

    if (controller.signal.aborted) return;

    const allFeatures: GeoJSON.Feature[] = [];
    for (const features of featureLists) allFeatures.push(...(features ?? []));

    const source = map.getSource(SHIP_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    source?.setData({ type: "FeatureCollection", features: allFeatures });
  }, [rawWindowMinutes, timeIso]);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const schedule = () => {
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = window.setTimeout(() => {
        refreshTimerRef.current = null;
        void refreshLiveShips();
      }, 80);
    };

    map.on("load", schedule);
    map.on("moveend", schedule);
    map.on("zoomend", schedule);

    schedule();

    return () => {
      map.off("load", schedule);
      map.off("moveend", schedule);
      map.off("zoomend", schedule);
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    };
  }, [refreshLiveShips]);

  React.useEffect(() => {
    if (!timeIso) return;
    void refreshLiveShips();
  }, [timeIso, refreshLiveShips]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius)] border border-[var(--border)]",
        className
      )}
    >
      <div ref={containerRef} className="absolute inset-0" />
      {mapError ? (
        <div className="absolute left-3 top-3 z-10 max-w-[min(520px,calc(100%-1.5rem))] rounded-lg border border-red-700/40 bg-black/70 px-3 py-2 text-xs text-red-200 backdrop-blur">
          {mapError}
        </div>
      ) : null}
    </div>
  );
}
