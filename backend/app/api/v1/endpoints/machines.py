from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.machine import Machine
from app.models.resource import Resource
from app.schemas.machine import MachineCreate, MachineOut, MachineUpdate

router = APIRouter()


@router.get("/resources/{resource_id}/machines", response_model=list[MachineOut])
def list_machines(resource_id: int, db: Session = Depends(get_db)):
    if not db.get(Resource, resource_id):
        raise HTTPException(status_code=404, detail="Resource not found")
    return db.query(Machine).filter(Machine.resource_id == resource_id).all()


@router.post(
    "/resources/{resource_id}/machines",
    response_model=MachineOut,
    status_code=status.HTTP_201_CREATED,
)
def create_machine(resource_id: int, payload: MachineCreate, db: Session = Depends(get_db)):
    if not db.get(Resource, resource_id):
        raise HTTPException(status_code=404, detail="Resource not found")
    machine = Machine(resource_id=resource_id, **payload.model_dump())
    db.add(machine)
    db.commit()
    db.refresh(machine)
    return machine


@router.put("/machines/{machine_id}", response_model=MachineOut)
def update_machine(machine_id: int, payload: MachineUpdate, db: Session = Depends(get_db)):
    machine = db.get(Machine, machine_id)
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(machine, k, v)
    db.commit()
    db.refresh(machine)
    return machine


@router.delete("/machines/{machine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_machine(machine_id: int, db: Session = Depends(get_db)):
    machine = db.get(Machine, machine_id)
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    db.delete(machine)
    db.commit()
