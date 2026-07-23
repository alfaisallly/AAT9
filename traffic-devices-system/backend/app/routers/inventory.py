from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user, require_roles
from app.database import get_db
from app.models import Device, DeviceModel, InventoryMovement, MovementType, User, UserRole
from app.schemas import InventoryMovementCreate, InventoryMovementResponse

router = APIRouter(prefix="/inventory", tags=["مخزن الأجهزة"])


@router.get("/", response_model=List[InventoryMovementResponse])
def list_movements(
    province_id: Optional[int] = None,
    movement_type: Optional[MovementType] = None,
    device_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = (
        db.query(InventoryMovement)
        .options(
            joinedload(InventoryMovement.device)
            .joinedload(Device.model)
            .joinedload(DeviceModel.brand)
        )
        .options(joinedload(InventoryMovement.province))
    )
    if province_id:
        query = query.filter(InventoryMovement.province_id == province_id)
    if movement_type:
        query = query.filter(InventoryMovement.movement_type == movement_type)
    if device_id:
        query = query.filter(InventoryMovement.device_id == device_id)

    return query.order_by(InventoryMovement.movement_date.desc(), InventoryMovement.id.desc()).all()


@router.post("/", response_model=InventoryMovementResponse)
def create_movement(
    data: InventoryMovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)),
):
    device = db.query(Device).filter(Device.id == data.device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="الجهاز غير موجود")

    previous_status = device.status
    movement = InventoryMovement(
        **data.model_dump(exclude={"update_device_status"}),
        previous_status=data.previous_status or previous_status,
        created_by_id=current_user.id,
    )
    db.add(movement)

    if data.update_device_status and data.new_status:
        device.status = data.new_status
    elif data.movement_type == MovementType.IN and not data.new_status:
        from app.models import DeviceStatus
        device.status = DeviceStatus.WORKING

    db.commit()
    db.refresh(movement)
    return _load_movement(db, movement.id)


@router.get("/{movement_id}", response_model=InventoryMovementResponse)
def get_movement(
    movement_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    movement = _load_movement(db, movement_id)
    if not movement:
        raise HTTPException(status_code=404, detail="الحركة غير موجودة")
    return movement


@router.delete("/{movement_id}")
def delete_movement(
    movement_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)),
):
    movement = db.query(InventoryMovement).filter(InventoryMovement.id == movement_id).first()
    if not movement:
        raise HTTPException(status_code=404, detail="الحركة غير موجودة")
    db.delete(movement)
    db.commit()
    return {"message": "تم حذف الحركة بنجاح"}


def _load_movement(db: Session, movement_id: int) -> Optional[InventoryMovement]:
    return (
        db.query(InventoryMovement)
        .options(
            joinedload(InventoryMovement.device)
            .joinedload(Device.model)
            .joinedload(DeviceModel.brand)
        )
        .options(joinedload(InventoryMovement.province))
        .filter(InventoryMovement.id == movement_id)
        .first()
    )
