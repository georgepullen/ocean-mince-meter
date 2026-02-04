"use client";

import * as React from "react";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import { Compass, Crosshair } from "lucide-react";
import { cn } from "@/lib/cn";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const DEFAULT_STYLE_URL = "https://demotiles.maplibre.org/style.json";

export type MapViewProps = {
  className?: string;
};

export function MapView({ className }: MapViewProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<MapLibreMap | null>(null);
  const [coords, setCoords] = React.useState<{ lng: number; lat: number } | null>(
    null
  );

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
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-left");

    map.on("mousemove", (e) => {
      setCoords({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [styleUrl]);

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-[var(--radius)] border border-border shadow-panel",
        className
      )}
    >
      <div ref={containerRef} className="absolute inset-0" />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px circle at 20% 10%, rgba(61,214,208,0.12), transparent 60%), radial-gradient(900px circle at 80% 80%, rgba(78,167,255,0.12), transparent 62%)",
          mixBlendMode: "overlay",
          opacity: 0.7,
        }}
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full border border-border/70 bg-surface/80 px-3 py-1.5 text-xs text-foreground backdrop-blur">
        <Compass className="h-4 w-4 opacity-80" strokeWidth={1.75} />
        <span className="font-medium">Night chart</span>
      </div>

      <TooltipProvider delayDuration={120}>
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/70 bg-surface/80 px-3 py-1.5 text-xs text-foreground backdrop-blur">
                <Crosshair className="h-4 w-4 opacity-80" strokeWidth={1.75} />
                <span className="font-mono tabular-nums text-foreground">
                  {coords
                    ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                    : "—"}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              Latitude, longitude under cursor
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
