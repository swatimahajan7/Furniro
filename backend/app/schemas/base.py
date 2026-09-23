from pydantic import BaseModel, ConfigDict


class Schema(BaseModel):
    """Base for every request/response schema: reads ORM attributes and trims input strings."""

    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)
