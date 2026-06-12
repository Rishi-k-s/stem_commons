from typing import Optional

from pydantic import BaseModel


class MachineBase(BaseModel):
    model_config = {"protected_namespaces": ()}

    name: str
    category: str
    model_specs: Optional[str] = None
    quantity: int = 1
    availability_status: str = "Available"
    access_conditions: Optional[str] = None


class MachineCreate(MachineBase):
    pass


class MachineUpdate(BaseModel):
    model_config = {"protected_namespaces": ()}

    name: Optional[str] = None
    category: Optional[str] = None
    model_specs: Optional[str] = None
    quantity: Optional[int] = None
    availability_status: Optional[str] = None
    access_conditions: Optional[str] = None


class MachineOut(MachineBase):
    id: int
    resource_id: int

    model_config = {"from_attributes": True, "protected_namespaces": ()}
