from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user
from app.database import get_db
from app.models import BookType, Brand, Device, DeviceModel, DeviceStatus, DeviceType, Directorate, OfficialBook, User
from app.schemas import DashboardStats
from app.services.scope import apply_directorate_scope, is_central_user

router = APIRouter(prefix="/dashboard", tags=["لوحة التحكم"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    directorate_id: Optional[int] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    device_query = db.query(Device)
    book_query = db.query(OfficialBook)
    device_query = apply_directorate_scope(device_query, user, Device, directorate_id)
    book_query = apply_directorate_scope(book_query, user, OfficialBook, directorate_id)

    total_devices = device_query.count()
    working_devices = device_query.filter(Device.status == DeviceStatus.WORKING).count()
    consumed_devices = total_devices - working_devices

    total_books = book_query.count()
    receipt_books = book_query.filter(OfficialBook.book_type == BookType.RECEIPT).count()
    delivery_books = book_query.filter(OfficialBook.book_type == BookType.DELIVERY).count()

    devices_by_type = {
        "desktop": device_query.filter(Device.device_type == DeviceType.DESKTOP).count(),
        "mobile": device_query.filter(Device.device_type == DeviceType.MOBILE).count(),
        "wheel": device_query.filter(Device.device_type == DeviceType.WHEEL).count(),
    }

    workplace_stats = (
        device_query.with_entities(
            func.coalesce(Device.workplace, Device.location, "غير محدد").label("workplace"),
            func.count(Device.id).label("count"),
        )
        .group_by("workplace")
        .order_by(func.count(Device.id).desc())
        .limit(15)
        .all()
    )

    brand_stats = (
        db.query(Brand.name_ar, func.count(Device.id).label("count"))
        .join(DeviceModel, DeviceModel.brand_id == Brand.id)
        .join(Device, Device.model_id == DeviceModel.id)
    )
    if directorate_id and is_central_user(user):
        brand_stats = brand_stats.filter(Device.directorate_id == directorate_id)
    elif not is_central_user(user) and user.directorate_id:
        brand_stats = brand_stats.filter(Device.directorate_id == user.directorate_id)
    brand_stats = brand_stats.group_by(Brand.id, Brand.name_ar).order_by(func.count(Device.id).desc()).all()

    directorate_stats = (
        db.query(Directorate.name_ar, func.count(Device.id).label("count"))
        .outerjoin(Device, Device.directorate_id == Directorate.id)
        .group_by(Directorate.id, Directorate.name_ar)
        .order_by(func.count(Device.id).desc())
        .all()
    )

    scope = "الموقف الموحد المركزي"
    directorate_name = None
    if directorate_id:
        d = db.query(Directorate).filter(Directorate.id == directorate_id).first()
        directorate_name = d.name_ar if d else None
        scope = directorate_name or scope
    elif not is_central_user(user) and user.directorate_id:
        d = db.query(Directorate).filter(Directorate.id == user.directorate_id).first()
        directorate_name = d.name_ar if d else None
        scope = directorate_name or "المديرية"

    readiness = round((working_devices / total_devices * 100) if total_devices else 0, 1)

    return DashboardStats(
        scope=scope,
        directorate_name=directorate_name,
        total_devices=total_devices,
        working_devices=working_devices,
        consumed_devices=consumed_devices,
        total_books=total_books,
        receipt_books=receipt_books,
        delivery_books=delivery_books,
        devices_by_type=devices_by_type,
        devices_by_workplace=[{"workplace": r.workplace, "count": r.count} for r in workplace_stats],
        devices_by_brand=[{"brand": r.name_ar, "count": r.count} for r in brand_stats],
        devices_by_directorate=[{"directorate": r.name_ar, "count": r.count} for r in directorate_stats],
        readiness_ratio=readiness,
    )
