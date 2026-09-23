"""Print the OpenAPI spec as stable, sorted JSON.

Usage: uv run python -m app.scripts.export_openapi > openapi.json
"""

import json
import sys

from app.main import create_app


def main() -> None:
    spec = create_app().openapi()
    sys.stdout.write(json.dumps(spec, indent=2, sort_keys=True) + "\n")


if __name__ == "__main__":
    main()
