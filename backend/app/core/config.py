from functools import lru_cache
from pathlib import Path
from typing import Annotated, Literal, Self

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

DEV_JWT_SECRET = "dev-insecure-secret-change-me"  # noqa: S105 - dev-only default

AppEnv = Literal["dev", "prod"]


class Settings(BaseSettings):
    """All runtime configuration. Read from environment variables or `backend/.env`."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: AppEnv = "dev"
    app_name: str = "Furniro API"
    log_level: str = "INFO"

    database_url: str = "sqlite:///./furniro.db"
    seed_on_startup: bool = True

    jwt_secret: str = DEV_JWT_SECRET
    jwt_expires_minutes: int = 1440

    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:5180"]
    media_dir: Path = Path("media")

    currency_code: str = "USD"
    currency_symbol: str = "$"
    currency_locale: str = "en-US"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @model_validator(mode="after")
    def _guard_prod(self) -> Self:
        if self.app_env == "prod" and self.jwt_secret == DEV_JWT_SECRET:
            raise ValueError("JWT_SECRET must be set when APP_ENV=prod")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
