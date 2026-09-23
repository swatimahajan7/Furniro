"""Seed the database with the deterministic baseline.

uv run python -m app.seed           # migrate, then seed only if the database is empty
uv run python -m app.seed --reset   # migrate, wipe every table, and reload the baseline
"""

import argparse

from app.core.config import get_settings
from app.core.logging import configure_logging
from app.db.migrate import upgrade_to_head
from app.db.session import get_sessionmaker
from app.seed.loader import run_seed


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m app.seed", description=__doc__)
    parser.add_argument("--reset", action="store_true", help="delete all rows before seeding")
    args = parser.parse_args()

    configure_logging(get_settings().log_level, json_output=False)
    upgrade_to_head()
    with get_sessionmaker()() as session:
        run_seed(session, reset=args.reset)


if __name__ == "__main__":
    main()
