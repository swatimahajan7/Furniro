import email_validator
from pydantic import BaseModel, ConfigDict

# The demo accounts use the reserved `.test` TLD (RFC 2606) so they can never reach a real
# inbox. email-validator rejects special-use domains by default; this is its documented opt-out.
if "test" in email_validator.SPECIAL_USE_DOMAIN_NAMES:
    email_validator.SPECIAL_USE_DOMAIN_NAMES.remove("test")


class Schema(BaseModel):
    """Base for every request/response schema: reads ORM attributes and trims input strings."""

    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)
