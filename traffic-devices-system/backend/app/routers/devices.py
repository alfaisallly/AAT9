from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user, require_roles
from app.database import get_db
from app.models import Device, DeviceModel, DeviceStatus, DeviceType, User, UserRole
from app.schemas import DeviceCreate, DeviceResponse, DeviceUpdate

router = APIRouter(prefix="/devices", tags=["الأجهزة"])


@router.get("/", response_model=List[DeviceResponse])
def list_devices(
    province_id: Optional[int] = None,
    status: Optional[DeviceStatus] = None,
    device_type: Optional[DeviceType] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = (
        db.query(Device)
        .options(joinedload(Device.model).joinedload(DeviceModel.brand))
        .options(joinedload(Device.province))
    )

    if province_id:
        query = query.filter(Device.province_id == province_id)
    if status:
        query = query.filter(Device.status == status)
    if device_type:
        query = query.filter(Device.device_type == device_type)
    if search:
        like = f"%{search}%"
        query = query.filter(
            (Device.serial_number.ilike(like))
            | (Device.asset_number.ilike(like))
            | (Device.location.ilike(like))
        )

    return query.order_by(Device.id.desc()).all()


@router.post("/", response_model=DeviceResponse)
def create_device(
    device_data: DeviceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)),
):
    if db.query(Device).filter(Device.serial_number == device_data.serial_number).first():
        raise HTTPException(status_code=400, detail="الرقم التسلسلي موجود مسبقاً")
    if device_data.asset_number and db.query(Device).filter(Device.asset_number == device_data.asset_number).first():
        raise HTTPException(status_code=400, detail="رقم الأصل موجود مسبقاً")

    device = Device(**device_data.model_dump(), created_by_id=current_user.id)
    db.add(device)
    db.commit()
    db.refresh(device)
    return _load_device(db, device.id)


@router.get("/{device_id}", response_model=DeviceResponse)
def get_device(
    device_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    device = _load_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="الجهاز غير موجود")
    return device


@router.put("/{device_id}", response_model=DeviceResponse)
def update_device(
    device_id: int,
    device_data: DeviceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)),
):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="الجهاز غير موجود")

    update_data = device_data.model_dump(exclude_unset=True)
    if "serial_number" in update_data:
        existing = db.query(Device).filter(
            Device.serial_number == update_data["serial_number"],
            Device.id != device_id,
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="الرقم التسلسلي موجود مسبقاً")

    for key, value in update_data.items():
        setattr(device, key, value)

    db.commit()
    return _load_device(db, device_id)


@router.delete("/{device_id}")
def delete_device(
    device_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="الجهاز غير موجود")
    db.delete(device)
    db.commit()
    return {"message": "تم حذف الجهاز بنجاح"}


def _load_device(db: Session, device_id: int) -> Optional[Device]:
    return (
        db.query(Device)
        .options(joinedload(Device.model).joinedload(DeviceModel.brand))
        .options(joinedload(Device.province))
        .filter(Device.id == device_id)
        .first()
    )
