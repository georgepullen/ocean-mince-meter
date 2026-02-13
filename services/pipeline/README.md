# Pipeline

Minimal AIS pipeline for live-ship-dot rendering.

## Environment

`services/pipeline/.env` must define:

- `DATABASE_URL`
- optional `AIS_RUN_ID`

## 1) Capture AIS stream to JSONL

```bash
set -a; source services/pipeline/.env; set +a
python services/pipeline/scripts/capture_aisstream.py
```

Defaults to `data/aisstream_channel.jsonl`.

## 2) Ingest raw points into Supabase/Postgres

```bash
set -a; source services/pipeline/.env; set +a
python -m services.pipeline.src.jobs.ingest_ais_raw_points --input data/aisstream_channel.jsonl
```

Accepted input formats:

- `.jsonl`
- `.csv`

Required columns/fields:

- `mmsi`
- `t` (ISO timestamp)
- `lat`
- `lon`
- `sog`

Optional:

- `cog`
- `source_message_type`
