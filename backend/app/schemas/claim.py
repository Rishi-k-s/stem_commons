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
    resource_name: Optional[str] = None
    claimer_name: str
    claimer_email: str
    claimer_phone: Optional[str] = None
    role: Optional[str] = None
    message: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None

    # Populated only in the response to an *approve* action so the admin can
    # share login details with the new facility owner. Never stored or listed.
    owner_email: Optional[str] = None
    owner_temp_password: Optional[str] = None
    owner_account_existed: Optional[bool] = None

    model_config = {"from_attributes": True}
