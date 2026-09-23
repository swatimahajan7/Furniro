from app.schemas.base import Schema


class CurrencyRead(Schema):
    code: str
    symbol: str
    minor_units: int
    locale: str


class MetaConfigRead(Schema):
    currency: CurrencyRead
    page_size_options: list[int]
    compare_limit: int
    free_shipping_threshold_minor: int | None


class ProvinceRead(Schema):
    code: str
    name: str


class CountryRead(Schema):
    code: str
    name: str
    provinces: list[ProvinceRead]
