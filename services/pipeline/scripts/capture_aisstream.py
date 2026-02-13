import asyncio
import json
import os
from datetime import datetime, timezone

import websockets
from dateutil import parser as dateparser

OUT = os.getenv("AIS_OUT", "data/aisstream_channel.jsonl")
API_KEY = os.environ["AISSTREAM_API_KEY"]
MAX_ROWS = int(os.getenv("AIS_MAX_ROWS", "0") or "0")  # 0 = unlimited
MAX_SECONDS = int(os.getenv("AIS_MAX_SECONDS", "0") or "0")  # 0 = unlimited

# English Channel-ish bbox:
# AISStream wants [[ [lat, lon], [lat, lon] ]]
BBOXES = [[[48.5, -6.5], [52.2, 3.0]]]

# Include both common position message types.
FILTER_TYPES = ["PositionReport", "StandardClassBPositionReport"]


def parse_time_utc(meta: dict) -> str:
    # Example (AISStream MetaData.time_utc): "2022-12-29 18:22:32.318353 +0000 UTC"
    s = meta.get("time_utc")
    if isinstance(s, str) and s.strip():
        try:
            return dateparser.parse(s.replace(" UTC", "")).astimezone(timezone.utc).isoformat()
        except Exception:
            pass
    return datetime.now(timezone.utc).isoformat()


def extract_row(msg: dict) -> dict | None:
    mtype = msg.get("MessageType")
    message = msg.get("Message", {})
    meta = msg.get("MetaData", {}) or msg.get("Metadata", {}) or {}

    if mtype not in FILTER_TYPES:
        return None

    body = message.get(mtype)
    if not isinstance(body, dict):
        return None

    # Fields needed for services.pipeline.src.jobs.aggregate_ais_to_intensity:
    # mmsi, t, lat, lon, sog
    mmsi = body.get("UserID") or meta.get("MMSI")
    lat = body.get("Latitude") or meta.get("latitude") or meta.get("Latitude")
    lon = body.get("Longitude") or meta.get("longitude") or meta.get("Longitude")
    sog = body.get("Sog")
    cog = body.get("Cog")

    if mmsi is None or lat is None or lon is None or sog is None:
        return None

    return {
        "mmsi": int(mmsi),
        "t": parse_time_utc(meta),
        "lat": float(lat),
        "lon": float(lon),
        "sog": float(sog),
        "cog": float(cog) if cog is not None else None,
        "source_message_type": str(mtype),
    }


async def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)

    async with websockets.connect("wss://stream.aisstream.io/v0/stream") as ws:
        sub = {
            "APIKey": API_KEY,
            "BoundingBoxes": BBOXES,
            "FilterMessageTypes": FILTER_TYPES,
        }
        await ws.send(json.dumps(sub))

        start = asyncio.get_running_loop().time()
        n = 0
        with open(OUT, "w", encoding="utf-8", buffering=1) as f:
            async for raw in ws:
                msg = json.loads(raw)
                row = extract_row(msg)
                if not row:
                    continue
                f.write(json.dumps(row) + "\n")
                f.flush()
                n += 1
                if n % 100 == 0:
                    print(f"Wrote {n} rows -> {OUT}")
                if MAX_ROWS and n >= MAX_ROWS:
                    break
                if MAX_SECONDS and (asyncio.get_running_loop().time() - start) >= MAX_SECONDS:
                    break


if __name__ == "__main__":
    asyncio.run(main())
