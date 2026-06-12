from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ReportCreate(BaseModel):
    reporter_name: Optional[str] = None
    reporter_email: Optional[str] = None
    issue_type: str
    description: str
    screenshot_url: Optional[str] = None


class ReportStatusUpdate(BaseModel):
    status: str  # Open / In Progress / Resolved / Invalid


class ReportOut(BaseModel):
    id: int
    resource_id: int
    resource_name: Optional[str] = None
    reporter_name: Optional[str] = None
    reporter_email: Optional[str] = None
    issue_type: str
    description: str
    status: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
