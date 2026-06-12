from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ClaimCreate(BaseModel):
    claimer_name: str
    claimer_email: str
    claimer_phone: Optional[str] = None
    role: Optional[str] = None
    proof_document_url: Optional[str] = None
    message: Optional[str] = None


class ClaimOut(BaseModel):
    id: int
    resource_id: int
    claimer_name: str
    claimer_email: str
    claimer_phone: Optional[str] = None
    role: Optional[str] = None
    message: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
