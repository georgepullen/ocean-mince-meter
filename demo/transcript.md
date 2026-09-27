# Codex runtime replay — Point Samson first test

- route: digitized-from-suunto-app-screenshot-port-samson-first-test (81 points, 817 m)
- replayed 1:1 in real time on 2026-09-27 against the live runtime (weather/marine fetched at replay time)
- codex wakes: 21, messages delivered: 4

## Watch-facing messages

**t+0:26** (replay clock 18:09:24, HR 114, -20.62657,117.20059)

```text
ALERT|1|0|0|0|0|PLACE|Point Samson coastal water; map confidence medium
ALERT|1|0|0|0|0|WATER|Sea 27C; waves about 0.1m, short 3.6s period
ALERT|1|0|0|0|0|FLOW|Current sets NW near 1.3 km/h; light westerly wind
```

**t+12:14** (replay clock 18:21:13, HR 142, -20.62865,117.20291)

```text
ALERT|2|0|0|0|0|AIS|Vessel scan not active; AIS traffic is unverified
```

## Wake cadence

21 agent wakes (≤1/min throttle), all rc=0. The agent stays silent on wakes with nothing new — the long quiet stretch mid-swim is expected behaviour, not a failure.
