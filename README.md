# Ocean Mince Meter

Open-water swim safety system for solo sea swims. It answers one question the
whole way down: **how dangerous is this water, right now, for this swimmer** —
from currents and weather to the ships transiting the swim line.

Three components, three repos:

| Component | What it does | Repo |
|---|---|---|
| **Swim buoy** | Suunto Race 2 watch → BLE → in-buoy ESP32 → LoRa radio → shore-side ESP32 → Wi-Fi uplink. Custom 20-byte telemetry packet keeps HR + GPS intact across all four hops. | [suunto-swim-buoy](https://github.com/georgepullen/suunto-swim-buoy) (private) |
| **Codex runtime** | Raspberry Pi ingest service + agent loop. Live swim frames wake the Codex agent (throttled to ≤1 run/min); it fuses GPS track, HR trend, Open-Meteo weather/marine, AIS vessel context and swim history into watch-facing messages capped at 80 ASCII chars with colour/header markup. | [suunto-codex-loop](https://github.com/georgepullen/suunto-codex-loop) (private) |
| **Risk backend** (this repo) | Live AIS ship traffic: Next.js map with live vessel dots, `aisstream` capture pipeline, Supabase/PostGIS storage. | this repo |

## Architecture

```mermaid
flowchart LR
    W[Suunto Race 2<br/>HR + GPS] -->|BLE| B[In-buoy ESP32<br/>buoy_node.ino]
    B -->|LoRa 868/915 MHz| S[Shore ESP32<br/>shore_node.ino]
    S -->|HTTPS + TLS| P[Raspberry Pi<br/>suunto-swim-ingest]
    P --> A[Codex agent runtime<br/>swim.mycyril.com]
    A -->|80-char watch message| S
    S -->|BLE| W
    OMM[OMM backend<br/>AIS + PostGIS] --> A
    WX[Open-Meteo<br/>weather + marine] --> A
```

## Why this is interesting engineering

- **Reverse-engineered wearable protocol.** The Suunto Race 2 companion BLE
  protocol is undocumented; the watch-side link, telemetry packet and a
  read-only SDK (+ MCP server) were built from protocol research in
  `suunto/reverse-engineering` and stabilized in `suunto/sdk`.
- **Constraint-driven agent design.** The LLM in the loop is not a chatbot:
  it runs under a hard output budget (80 ASCII chars, 3 messages per shore
  response), a wake budget (≤1 run/min, silent on stale frames), and a
  briefing/heartbeat policy that distinguishes sea swims from pool/inland
  test sessions before it speaks.
- **End-to-end data integrity.** HR and GPS survive watch → MCU → radio →
  radio → HTTP → agent; the shore node persists endpoint/token/TLS config in
  NVS and validates TLS rather than trusting the LAN.
- **Deterministic replay.** `codex-loop/bin/replay-swim` feeds a recorded
  GPS/HR route back through the *real* runtime — same ingest, same agent,
  same delivery path — regenerating the exact watch messages a swim would
  have produced. Used for debriefs and demos.
- **Live ship traffic.** The backend ingests `aisstream` into PostGIS and
  serves time-windowed vessel positions to the map; the same AIS context is
  available to the runtime as swim-time vessel risk.

## Field status

First end-to-end field test completed at Port Samson, Australia: watch →
buoy → LoRa → shore → Pi → live codex analysis, with the watch displaying
runtime messages mid-swim. Test routes are recorded on the Suunto watch and
replayed through the runtime for reproducible transcripts.

## Local development (backend)

Start Supabase:

```bash
supabase start
supabase db reset
```

Run the app:

```bash
pnpm dev
```

Core endpoints:

- `GET /api/ais-latest`
- `GET /api/tiles?z&x&y&time&rawWindowMinutes`

### Layout

- `apps/web`: Next.js app (map UI + API routes)
- `packages/db`: shared Supabase config helpers (`@ocean/db`)
- `services/pipeline`: AIS capture + raw-point ingest scripts
- `supabase`: Supabase config + migrations
