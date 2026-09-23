"""Store configuration and reference data that the frontend needs up front."""

import json
from functools import lru_cache
from pathlib import Path

from app.core.config import Settings
from app.core.pagination import PRODUCT_PAGE_SIZES
from app.schemas.meta import CountryRead, CurrencyRead, MetaConfigRead
from app.services.catalog import COMPARE_LIMIT

LOCATIONS_FILE = Path(__file__).resolve().parents[1] / "seed" / "data" / "locations.json"


def get_config(settings: Settings) -> MetaConfigRead:
    return MetaConfigRead(
        currency=CurrencyRead(
            code=settings.currency_code,
            symbol=settings.currency_symbol,
            minor_units=2,
            locale=settings.currency_locale,
        ),
        page_size_options=list(PRODUCT_PAGE_SIZES),
        compare_limit=COMPARE_LIMIT,
        # Shipping is always free (PLAN.md §2.2), so there is no threshold.
        free_shipping_threshold_minor=None,
    )


@lru_cache
def get_locations() -> tuple[CountryRead, ...]:
    raw = json.loads(LOCATIONS_FILE.read_text(encoding="utf-8"))
    return tuple(CountryRead.model_validate(country) for country in raw)
