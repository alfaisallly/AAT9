from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import BookType, Device, DeviceStatus, DeviceType, OfficialBook, Province, User
from app.schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["لوحة التحكم"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    province_id: int | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    device_query = db.query(Device)
    book_query = db.query(OfficialBook)

    if province_id:
        device_query = device_query.filter(Device.province_id == province_id)
        book_query = book_query.filter(OfficialBook.province_id == province_id)

    total_devices = device_query.count()
    working_devices = device_query.filter(Device.status == DeviceStatus.WORKING).count()
    consumed_non_disabled = device_query.filter(
        Device.status == DeviceStatus.CONSUMED_NON_DISABLED
    ).count()
    consumed_disabled = device_query.filter(
        Device.status == DeviceStatus.CONSUMED_DISABLED
    ).count()

    total_books = book_query.count()
    receipt_books = book_query.filter(OfficialBook.book_type == BookType.RECEIPT).count()
    delivery_books = book_query.filter(OfficialBook.book_type == BookType.DELIVERY).count()

    devices_by_type = {
        "desktop": device_query.filter(Device.device_type == DeviceType.DESKTOP).count(),
        "mobile": device_query.filter(Device.device_type == DeviceType.MOBILE).count(),
        "wheel": device_query.filter(Device.device_type == DeviceType.WHEEL).count(),
    }

    province_stats = (
        db.query(
            Province.name_ar,
            func.count(Device.id).label("count"),
        )
        .outerjoin(Device, Device.province_id == Province.id)
        .group_by(Province.id, Province.name_ar)
        .order_by(func.count(Device.id).desc())
        .all()
    )

    return DashboardStats(
        total_devices=total_devices,
        working_devices=working_devices,
        consumed_non_disabled=consumed_non_disabled,
        consumed_disabled=consumed_disabled,
        total_books=total_books,
        receipt_books=receipt_books,
        delivery_books=delivery_books,
        devices_by_type=devices_by_type,
        devices_by_province=[
            {"province": row.name_ar, "count": row.count} for row in province_stats
        ],
    )
