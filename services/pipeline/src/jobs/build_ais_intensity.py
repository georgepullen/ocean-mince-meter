import pandas as pd
from sqlalchemy import text

from ..db import get_engine


def main():
    engine = get_engine()
    df = pd.DataFrame([
        {
            "cell_id": "fake_cell",
            "hour": "2026-02-03T10:00:00Z",
            "lambda": 0.25,
            "mean_speed": 12.0,
            "mean_heading": 90.0,
            "pipeline_git_sha": "local",
            "data_vintage": "2026-02-03T10:00:00Z",
        }
    ])

    with engine.begin() as conn:
        conn.execute(
            text(
                """
                insert into public.grid_cells (cell_id, geom, resolution)
                values (
                    :cell_id,
                    st_geomfromtext('POLYGON((-4 50, -4 50.01, -3.99 50.01, -3.99 50, -4 50))', 4326),
                    9
                )
                on conflict (cell_id) do nothing;
                """
            ),
            {"cell_id": "fake_cell"},
        )
        conn.execute(
            text(
                """
                insert into public.ais_intensity (
                    cell_id,
                    hour,
                    lambda,
                    mean_speed,
                    mean_heading,
                    pipeline_git_sha,
                    data_vintage
                )
                values (
                    :cell_id,
                    :hour,
                    :lambda,
                    :mean_speed,
                    :mean_heading,
                    :pipeline_git_sha,
                    :data_vintage
                )
                on conflict (cell_id, hour) do update
                set lambda = excluded.lambda,
                    mean_speed = excluded.mean_speed,
                    mean_heading = excluded.mean_heading,
                    pipeline_git_sha = excluded.pipeline_git_sha,
                    data_vintage = excluded.data_vintage;
                """
            ),
            df.to_dict(orient="records"),
        )


if __name__ == "__main__":
    main()
