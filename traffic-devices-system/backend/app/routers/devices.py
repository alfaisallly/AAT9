from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user, require_roles
from app.database import get_db
from app.models import Device, DeviceDocument, DeviceModel, DeviceStatus, DeviceType, User, UserRole
from app.schemas import DeviceCreate, DeviceDocumentCreate, DeviceDocumentResponse, DeviceResponse, DeviceUpdate
from app.services.scope import apply_directorate_scope, ensure_directorate_access, is_central_user, resolve_directorate_id

router = APIRouter(prefix="/devices", tags=["الأجهزة"])

MANAGE_ROLES = (UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
DELETE_ROLES = (UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)


def _load_device(db: Session, device_id: int) -> Optional[Device]:
    return (
        db.query(Device)
        .options(joinedload(Device.model).joinedload(DeviceModel.brand))
        .options(joinedload(Device.province))
        .options(joinedload(Device.directorate))
        .options(joinedload(Device.documents))
        .filter(Device.id == device_id)
        .first()
    )


@router.get("/", response_model=List[DeviceResponse])
def list_devices(
    province_id: Optional[int] = None,
    directorate_id: Optional[int] = None,
    status: Optional[DeviceStatus] = None,
    device_type: Optional[DeviceType] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = (
        db.query(Device)
        .options(joinedload(Device.model).joinedload(DeviceModel.brand))
        .options(joinedload(Device.province))
        .options(joinedload(Device.directorate))
        .options(joinedload(Device.documents))
    )
    query = apply_directorate_scope(query, user, Device, directorate_id)

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
            | (Device.manufacturer_serial.ilike(like))
            | (Device.asset_number.ilike(like))
            | (Device.location.ilike(like))
            | (Device.workplace.ilike(like))
            | (Device.department.ilike(like))
            | (Device.assigned_to.ilike(like))
        )

    return query.order_by(Device.id.desc()).all()


@router.post("/", response_model=DeviceResponse)
def create_device(
    device_data: DeviceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*MANAGE_ROLES)),
):
    directorate_id = resolve_directorate_id(current_user, device_data.directorate_id)
    if not directorate_id:
        raise HTTPException(status_code=400, detail="يجب تحديد المديرية")
    ensure_directorate_access(current_user, directorate_id)

    if db.query(Device).filter(Device.serial_number == device_data.serial_number).first():
        raise HTTPException(status_code=400, detail="الرقم التسلسلي موجود مسبقاً")

    data = device_data.model_dump(exclude={"documents"})
    data["directorate_id"] = directorate_id
    data["created_by_id"] = current_user.id

    device = Device(**data)
    db.add(device)
    db.flush()

    for doc in device_data.documents:
        db.add(DeviceDocument(device_id=device.id, created_by_id=current_user.id, **doc.model_dump()))

    db.commit()
    return _load_device(db, device.id)


@router.get("/{device_id}", response_model=DeviceResponse)
def get_device(device_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    device = _load_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="الجهاز غير موجود")
    ensure_directorate_access(user, device.directorate_id)
    return device


@router.put("/{device_id}", response_model=DeviceResponse)
def update_device(
    device_id: int,
    device_data: DeviceUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(*MANAGE_ROLES)),
):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="الجهاز غير موجود")
    ensure_directorate_access(user, device.directorate_id)

    update_data = device_data.model_dump(exclude_unset=True)
    if "directorate_id" in update_data:
        ensure_directorate_access(user, update_data["directorate_id"])
        if not is_central_user(user):
            update_data["directorate_id"] = user.directorate_id

    for key, value in update_data.items():
        setattr(device, key, value)

    db.commit()
    return _load_device(db, device_id)


@router.delete("/{device_id}")
def delete_device(
    device_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(*DELETE_ROLES)),
):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="الجهاز غير موجود")
    ensure_directorate_access(user, device.directorate_id)
    db.delete(device)
    db.commit()
    return {"message": "تم حذف الجهاز بنجاح"}


@router.post("/{device_id}/documents", response_model=DeviceDocumentResponse)
def add_document(
    device_id: int,
    doc_data: DeviceDocumentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(*MANAGE_ROLES)),
):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="الجهاز غير موجود")
    ensure_directorate_access(user, device.directorate_id)

    doc = DeviceDocument(device_id=device_id, created_by_id=user.id, **doc_data.model_dump())
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc
