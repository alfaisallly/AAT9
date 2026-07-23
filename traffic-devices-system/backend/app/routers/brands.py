from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user, require_roles
from app.database import get_db
from app.models import Brand, DeviceModel, User, UserRole
from app.schemas import BrandCreate, BrandResponse, DeviceModelCreate, DeviceModelResponse

router = APIRouter(prefix="/brands", tags=["الشركات والموديلات"])


@router.get("/", response_model=List[BrandResponse])
def list_brands(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(Brand).filter(Brand.is_active == True).order_by(Brand.name_ar).all()


@router.post("/", response_model=BrandResponse)
def create_brand(
    brand_data: BrandCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    if db.query(Brand).filter(Brand.name == brand_data.name).first():
        raise HTTPException(status_code=400, detail="الشركة موجودة مسبقاً")
    brand = Brand(**brand_data.model_dump())
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand


@router.get("/models", response_model=List[DeviceModelResponse])
def list_models(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return (
        db.query(DeviceModel)
        .options(joinedload(DeviceModel.brand))
        .filter(DeviceModel.is_active == True)
        .order_by(DeviceModel.name)
        .all()
    )


@router.post("/models", response_model=DeviceModelResponse)
def create_model(
    model_data: DeviceModelCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    brand = db.query(Brand).filter(Brand.id == model_data.brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="الشركة غير موجودة")

    model = DeviceModel(**model_data.model_dump())
    db.add(model)
    db.commit()
    db.refresh(model)
    model = (
        db.query(DeviceModel)
        .options(joinedload(DeviceModel.brand))
        .filter(DeviceModel.id == model.id)
        .first()
    )
    return model
