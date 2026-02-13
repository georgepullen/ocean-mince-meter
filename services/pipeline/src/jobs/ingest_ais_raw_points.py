import argparse
import csv
import json
import os
from datetime import datetime
from pathlib import Path

from sqlalchemy import text

from ..db import get_engine


def parse_args():
    parser = argparse.ArgumentParser(
        description="Load raw AIS point rows into public.ais_raw_points."
    )
    parser.add_argument(
        "--input",
        default=os.getenv("AIS_INPUT", "data/aisstream_channel.jsonl"),
        help="Input file path (.jsonl or .csv).",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=int(os.getenv("AIS_BATCH_SIZE", "5000")),
        help="Number of rows to insert per batch.",
    )
    parser.add_argument(
        "--run-id",
        default=os.getenv("AIS_RUN_ID"),
        help="Optional run_id UUID to attach to all rows.",
    )
    return parser.parse_args()


def parse_iso_utc(value: str) -> datetime:
    s = value.strip()
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    return datetime.fromisoformat(s)


def normalize_row(raw: dict, run_id: str | None):
    mmsi = raw.get("mmsi")
    t = raw.get("t")
    lat = raw.get("lat")
    lon = raw.get("lon")
    sog = raw.get("sog")

    if mmsi is None or t is None or lat is None or lon is None or sog is None:
        return None

    try:
        parsed = {
            "mmsi": int(mmsi),
            "t": parse_iso_utc(str(t)),
            "lat": float(lat),
            "lon": float(lon),
            "sog": float(sog),
            "cog": float(raw["cog"]) if raw.get("cog") not in (None, "") else None,
            "source_message_type": (
                str(raw.get("source_message_type"))
                if raw.get("source_message_type") not in (None, "")
                else None
            ),
            "run_id": run_id,
        }
    except Exception:
        return None

    if not (-90 <= parsed["lat"] <= 90 and -180 <= parsed["lon"] <= 180):
        return None
    return parsed


def iter_rows(path: Path, run_id: str | None):
    suffix = path.suffix.lower()
    if suffix == ".jsonl":
        with path.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    raw = json.loads(line)
                except json.JSONDecodeError:
                    continue
                row = normalize_row(raw, run_id)
                if row:
                    yield row
        return

    if suffix == ".csv":
        with path.open("r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)
            for raw in reader:
                row = normalize_row(raw, run_id)
                if row:
                    yield row
        return

    raise SystemExit("Unsupported input format. Use .jsonl or .csv")


def chunks(items, size: int):
    batch = []
    for item in items:
        batch.append(item)
        if len(batch) >= size:
            yield batch
            batch = []
    if batch:
        yield batch


def main():
    args = parse_args()
    input_path = Path(args.input)

    if args.batch_size <= 0:
        raise SystemExit("--batch-size must be > 0")
    if not input_path.exists():
        raise SystemExit(f"Input file not found: {input_path}")

    sql = text(
        """
        insert into public.ais_raw_points (
          mmsi,
          t,
          geom,
          sog,
          cog,
          source_message_type,
          run_id
        )
        values (
          :mmsi,
          :t,
          st_setsrid(st_makepoint(:lon, :lat), 4326),
          :sog,
          :cog,
          :source_message_type,
          cast(:run_id as uuid)
        );
        """
    )

    total = 0
    engine = get_engine()
    with engine.begin() as conn:
        for batch in chunks(iter_rows(input_path, args.run_id), args.batch_size):
            conn.execute(sql, batch)
            total += len(batch)
            print(f"Inserted {total} rows")

    print(f"Done. Inserted {total} rows from {input_path}")


if __name__ == "__main__":
    main()
