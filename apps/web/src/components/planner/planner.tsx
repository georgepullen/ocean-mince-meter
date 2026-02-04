"use client";

import * as React from "react";
import { AlertTriangle, Pause, Play, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { ForecastRunStamp } from "@/components/risk/forecast-run-stamp";
import { LayerToggleRow } from "@/components/risk/layer-toggle-row";
import { LegendBar } from "@/components/risk/legend-bar";
import { RiskSummary } from "@/components/risk/risk-summary";
import { MapView } from "@/components/map/map-view";
import { type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@/components/ui/panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider, SliderRange, SliderThumb, SliderTrack } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DEMO_CELL_IDS = ["8928308280fffff", "8928308280bffff", "89283082807ffff"];

type RouteMode = "out-and-back" | "point-to-point" | "loop";

type LayerState = {
  enabled: boolean;
  opacity: number;
};

function formatDateTimeLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIsoFromLocalInput(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

export function Planner() {
  const initialStartLocal = React.useMemo(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    return formatDateTimeLocal(d);
  }, []);

  const [startLocal, setStartLocal] = React.useState(initialStartLocal);
  const [hours, setHours] = React.useState(3);
  const [routeMode, setRouteMode] = React.useState<RouteMode>("out-and-back");

  const [riskLoading, setRiskLoading] = React.useState(false);
  const [riskValue, setRiskValue] = React.useState<number | null>(null);
  const [riskError, setRiskError] = React.useState<string | null>(null);

  const [layers, setLayers] = React.useState<{
    drift: LayerState;
    currents: LayerState;
    ships: LayerState;
  }>({
    drift: { enabled: true, opacity: 0.85 },
    currents: { enabled: true, opacity: 0.65 },
    ships: { enabled: true, opacity: 0.55 },
  });

  const [tHours, setTHours] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    setTHours((v) => Math.min(v, Math.max(0, hours)));
  }, [hours]);

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setTHours((prev) => {
        const next = prev + 0.25;
        return next > hours ? 0 : next;
      });
    }, 1100);
    return () => window.clearInterval(id);
  }, [playing, hours]);

  const startIso = React.useMemo(() => {
    return toIsoFromLocalInput(startLocal);
  }, [startLocal]);

  const cursorTimeLabel = React.useMemo(() => {
    if (!startIso) return "—";
    const base = new Date(startIso);
    const current = new Date(base.getTime() + tHours * 60 * 60 * 1000);
    return current.toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [startIso, tHours]);

  const risk = React.useMemo(() => {
    if (riskLoading) {
      return {
        state: "unknown" as BadgeVariant,
        headline: "Computing corridor…",
        value: undefined,
        detail: "Querying AIS intensity for the selected window.",
      };
    }
    if (riskError) {
      return {
        state: "unknown" as BadgeVariant,
        headline: "Abstain",
        value: undefined,
        detail: riskError,
      };
    }
    if (riskValue == null) {
      return {
        state: "unknown" as BadgeVariant,
        headline: "No run yet",
        value: undefined,
        detail: "Run a quick risk check to populate demo outputs.",
      };
    }
    if (riskValue < 10) {
      return {
        state: "safe" as BadgeVariant,
        headline: "Clear window",
        value: riskValue.toFixed(2),
        detail: "Low ship-traffic proxy in the sampled cells.",
      };
    }
    if (riskValue < 40) {
      return {
        state: "caution" as BadgeVariant,
        headline: "Proceed cautiously",
        value: riskValue.toFixed(2),
        detail: "Moderate ship-traffic proxy. Favor visibility + escorting.",
      };
    }
    return {
      state: "danger" as BadgeVariant,
      headline: "High exposure",
      value: riskValue.toFixed(2),
      detail: "Elevated ship-traffic proxy. Consider a no-go decision.",
    };
  }, [riskError, riskLoading, riskValue]);

  async function runRiskCheck() {
    if (!startIso) {
      setRiskError("Invalid start time.");
      return;
    }

    setRiskLoading(true);
    setRiskError(null);
    try {
      const res = await fetch("/api/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cellIds: DEMO_CELL_IDS,
          startTime: startIso,
          hours,
        }),
      });

      const json = (await res.json()) as { shipRiskProxy?: number; error?: string };
      if (!res.ok) throw new Error(json.error || "Request failed.");
      setRiskValue(typeof json.shipRiskProxy === "number" ? json.shipRiskProxy : 0);
    } catch (e) {
      setRiskValue(null);
      setRiskError(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setRiskLoading(false);
    }
  }

  const leftPanel = (
    <Panel className="h-full">
      <PanelHeader>
        <PanelTitle>Plan</PanelTitle>
        <div className="text-xs text-muted">Local time</div>
      </PanelHeader>
      <PanelContent className="space-y-4">
        <Field label="Start time">
          <Input
            type="datetime-local"
            value={startLocal}
            onChange={(e) => setStartLocal(e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Duration (h)">
            <Input
              type="number"
              min={1}
              step={1}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
            />
          </Field>
          <Field label="Route mode">
            <Select value={routeMode} onValueChange={(v) => setRouteMode(v as RouteMode)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="out-and-back">Out-and-back</SelectItem>
                <SelectItem value="point-to-point">Point-to-point</SelectItem>
                <SelectItem value="loop">Loop</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Button onClick={runRiskCheck} disabled={riskLoading}>
          {riskLoading ? "Running…" : "Run quick risk check"}
        </Button>
        <div className="rounded-lg border border-border/70 bg-surface-2/40 p-3 text-xs text-muted">
          Demo run uses a small fixed set of H3 cell IDs. Replace with a real route
          → cells query when routing is wired up.
        </div>
      </PanelContent>
    </Panel>
  );

  const layersPanel = (
    <Panel>
      <PanelHeader>
        <PanelTitle>Layers</PanelTitle>
        <div className="text-xs text-muted">Opacity</div>
      </PanelHeader>
      <PanelContent className="space-y-4">
        <LayerToggleRow
          label="Drift corridor"
          description="50/80/95% probability bands"
          color="var(--data-current-low)"
          enabled={layers.drift.enabled}
          onEnabledChange={(enabled) =>
            setLayers((s) => ({ ...s, drift: { ...s.drift, enabled } }))
          }
          opacity={layers.drift.opacity}
          onOpacityChange={(opacity) =>
            setLayers((s) => ({ ...s, drift: { ...s.drift, opacity: clamp01(opacity) } }))
          }
        />
        <LayerToggleRow
          label="Surface currents"
          description="Model + ML residual (demo)"
          color="var(--data-current-high)"
          enabled={layers.currents.enabled}
          onEnabledChange={(enabled) =>
            setLayers((s) => ({ ...s, currents: { ...s.currents, enabled } }))
          }
          opacity={layers.currents.opacity}
          onOpacityChange={(opacity) =>
            setLayers((s) => ({
              ...s,
              currents: { ...s.currents, opacity: clamp01(opacity) },
            }))
          }
        />
        <LayerToggleRow
          label="Ship risk"
          description="AIS intensity heat"
          color="rgba(255,107,107,0.75)"
          enabled={layers.ships.enabled}
          onEnabledChange={(enabled) =>
            setLayers((s) => ({ ...s, ships: { ...s.ships, enabled } }))
          }
          opacity={layers.ships.opacity}
          onOpacityChange={(opacity) =>
            setLayers((s) => ({ ...s, ships: { ...s.ships, opacity: clamp01(opacity) } }))
          }
        />
      </PanelContent>
    </Panel>
  );

  const riskPanel = (
    <Panel>
      <PanelHeader>
        <PanelTitle>Assessment</PanelTitle>
        <div className="text-xs text-muted">Conservative by design</div>
      </PanelHeader>
      <PanelContent className="space-y-5">
        <RiskSummary {...risk} />
        <div className="grid gap-4">
          <LegendBar
            title="Currents"
            units="m/s"
            minLabel="0"
            maxLabel="2.0+"
          />
          <LegendBar
            title="Ship traffic"
            units="ships/hour"
            minLabel="low"
            maxLabel="high"
            gradient="linear-gradient(90deg, var(--data-ais-low), var(--data-ais-high))"
          />
        </div>
        <ForecastRunStamp
          source="Copernicus (demo)"
          runTime={startIso ? new Date(startIso).toISOString().slice(0, 16) + "Z" : "—"}
          validFrom={startIso ? new Date(startIso).toISOString().slice(0, 16) + "Z" : "—"}
          validTo={
            startIso
              ? new Date(
                  new Date(startIso).getTime() + hours * 60 * 60 * 1000
                )
                  .toISOString()
                  .slice(0, 16) + "Z"
              : "—"
          }
        />
      </PanelContent>
    </Panel>
  );

  const rightPanel = (
    <div className="space-y-4">
      {riskPanel}
      {layersPanel}
      <Panel>
        <PanelHeader>
          <PanelTitle>Notes</PanelTitle>
          <div className="text-xs text-muted">Abstain-aware</div>
        </PanelHeader>
        <PanelContent className="space-y-3 text-sm text-muted">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" strokeWidth={1.75} />
            <div>
              Treat this as a themed shell. The “risk” number is a proxy until a
              real route→grid sampler and model runs are wired in.
            </div>
          </div>
        </PanelContent>
      </Panel>
    </div>
  );

  const bottomOverlay = (
    <div className="w-[min(760px,calc(100vw-2rem))] rounded-full border border-border bg-surface/70 px-3 py-2 shadow-panel backdrop-blur">
      <div className="flex items-center gap-3">
        <IconButton
          variant="ghost"
          shape="circle"
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => setPlaying((v) => !v)}
        >
          {playing ? (
            <Pause className="h-4 w-4 opacity-80" strokeWidth={1.75} />
          ) : (
            <Play className="h-4 w-4 opacity-80" strokeWidth={1.75} />
          )}
        </IconButton>
        <div className="min-w-[110px] text-xs text-muted">
          <div className="font-medium text-foreground">{cursorTimeLabel}</div>
          <div className="font-mono tabular-nums">t+{tHours.toFixed(2)}h</div>
        </div>
        <div className="flex-1">
          <Slider
            value={[tHours]}
            min={0}
            max={Math.max(0.5, hours)}
            step={0.25}
            onValueChange={(v) => setTHours(v[0] ?? 0)}
          >
            <SliderTrack>
              <SliderRange />
            </SliderTrack>
            <SliderThumb aria-label="Time" />
          </Slider>
        </div>
      </div>
    </div>
  );

  const mobileSheet = (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="h-12 w-full justify-between">
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 opacity-80" strokeWidth={1.75} />
            Panels
          </span>
          <span className="text-xs text-muted">
            {risk.state === "unknown" ? "Abstain" : risk.state}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="left-0 right-0 top-auto bottom-0 w-full max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-[var(--radius)]">
        <DialogHeader className="pb-4">
          <DialogTitle>Panels</DialogTitle>
        </DialogHeader>
        <DialogBody className="max-h-[78dvh] overflow-auto pt-0">
          <Tabs defaultValue="plan">
            <TabsList className="w-full">
              <TabsTrigger className="flex-1" value="plan">
                Plan
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="risk">
                Risk
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="layers">
                Layers
              </TabsTrigger>
            </TabsList>
            <TabsContent value="plan">
              <div className="space-y-4">{leftPanel}</div>
            </TabsContent>
            <TabsContent value="risk">
              <div className="space-y-4">{riskPanel}</div>
            </TabsContent>
            <TabsContent value="layers">
              <div className="space-y-4">{layersPanel}</div>
            </TabsContent>
          </Tabs>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );

  return (
    <AppShell
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      map={<MapView />}
      bottomOverlay={bottomOverlay}
      mobileSheet={mobileSheet}
    />
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
        {label}
      </div>
      {children}
    </label>
  );
}

