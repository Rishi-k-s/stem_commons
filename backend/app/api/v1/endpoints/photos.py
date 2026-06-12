from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.photo import Photo
from app.models.resource import Resource
from app.schemas.photo import PhotoCreate, PhotoOut

router = APIRouter()


@router.get("/resources/{resource_id}/photos", response_model=list[PhotoOut])
def list_photos(resource_id: int, db: Session = Depends(get_db)):
    if not db.get(Resource, resource_id):
        raise HTTPException(status_code=404, detail="Resource not found")
    return db.query(Photo).filter(Photo.resource_id == resource_id).all()


@router.post(
    "/resources/{resource_id}/photos",
    response_model=PhotoOut,
    status_code=status.HTTP_201_CREATED,
)
def add_photo(resource_id: int, payload: PhotoCreate, db: Session = Depends(get_db)):
    if not db.get(Resource, resource_id):
        raise HTTPException(status_code=404, detail="Resource not found")
    photo = Photo(resource_id=resource_id, **payload.model_dump())
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


@router.delete("/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.get(Photo, photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    db.delete(photo)
    db.commit()
