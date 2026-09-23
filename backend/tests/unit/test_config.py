import pytest
from pydantic import ValidationError

from app.core.config import DEV_JWT_SECRET, Settings


def make_settings(**overrides: object) -> Settings:
    # _env_file=None: ignore any local backend/.env so tests are hermetic.
    return Settings(_env_file=None, **overrides)  # type: ignore[call-arg]


def test_prod_without_jwt_secret_is_rejected() -> None:
    with pytest.raises(ValidationError, match="JWT_SECRET"):
        make_settings(app_env="prod", jwt_secret=DEV_JWT_SECRET)


def test_prod_with_bug_toggles_is_rejected() -> None:
    with pytest.raises(ValidationError, match="BUG_TOGGLES_ENABLED"):
        make_settings(app_env="prod", jwt_secret="s3cret-value", bug_toggles_enabled=True)


def test_prod_with_secret_and_no_bug_toggles_is_accepted() -> None:
    settings = make_settings(app_env="prod", jwt_secret="s3cret-value")

    assert settings.app_env == "prod"


def test_test_env_allows_bug_toggles() -> None:
    settings = make_settings(app_env="test", bug_toggles_enabled=True)

    assert settings.is_test
    assert settings.bug_toggles_enabled


def test_cors_origins_parsed_from_comma_separated_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", "http://a.test, http://b.test,")

    assert make_settings().cors_origins == ["http://a.test", "http://b.test"]


def test_currency_defaults_to_usd() -> None:
    settings = make_settings()

    assert (settings.currency_code, settings.currency_symbol) == ("USD", "$")
