from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PhotoBase(BaseModel):
    image_url: str
    caption: Optional[str] = None


class PhotoCreate(PhotoBase):
    pass


class PhotoOut(PhotoBase):
    id: int
    resource_id: int
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
