from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user
from app.database import get_db
from app.models import (
    BookType,
    Brand,
    Device,
    DeviceModel,
    DeviceStatus,
    DeviceType,
    Directorate,
    OfficialBook,
    Province,
    User,
)
from app.schemas import (
    DashboardStats,
    DeviceTypeBreakdown,
    ProvinceDeviceRow,
    ProvinceDashboardStats,
    ProvincesOverview,
)
from app.services.scope import apply_directorate_scope, is_central_user

router = APIRouter(prefix="/dashboard", tags=["لوحة التحكم"])


def _scope_label(db: Session, user: User, directorate_id: Optional[int]) -> tuple[str, Optional[str]]:
    scope = "الموقف الموحد المركزي — جميع المحافظات"
    directorate_name = None
    if directorate_id:
        d = db.query(Directorate).filter(Directorate.id == directorate_id).first()
        directorate_name = d.name_ar if d else None
        scope = directorate_name or scope
    elif not is_central_user(user) and user.directorate_id:
        d = db.query(Directorate).filter(Directorate.id == user.directorate_id).first()
        directorate_name = d.name_ar if d else None
        scope = directorate_name or "المديرية"
    return scope, directorate_name


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

    scope, directorate_name = _scope_label(db, user, directorate_id)
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


def _type_breakdown(devices: List[Device]) -> dict[str, DeviceTypeBreakdown]:
    result = {}
    for dt in DeviceType:
        typed = [d for d in devices if d.device_type == dt]
        working = sum(1 for d in typed if d.status == DeviceStatus.WORKING)
        result[dt.value] = DeviceTypeBreakdown(
            total=len(typed),
            working=working,
            consumed=len(typed) - working,
        )
    return result


def _device_row(device: Device) -> ProvinceDeviceRow:
    brand_name = device.model.brand.name_ar if device.model and device.model.brand else "—"
    model_name = device.model.name if device.model else "—"
    return ProvinceDeviceRow(
        id=device.id,
        serial_number=device.serial_number,
        manufacturer_serial=device.manufacturer_serial,
        device_type=device.device_type.value,
        status=device.status.value,
        brand_name=brand_name,
        model_name=model_name,
        directorate_name=device.directorate.name_ar if device.directorate else None,
        workplace=device.workplace or device.location,
    )


@router.get("/provinces-overview", response_model=ProvincesOverview)
def get_provinces_overview(
    directorate_id: Optional[int] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    device_query = (
        db.query(Device)
        .options(joinedload(Device.model).joinedload(DeviceModel.brand))
        .options(joinedload(Device.province))
        .options(joinedload(Device.directorate))
    )
    device_query = apply_directorate_scope(device_query, user, Device, directorate_id)
    devices = device_query.order_by(Device.province_id, Device.id.desc()).all()

    grouped: dict[int, List[Device]] = {}
    for device in devices:
        grouped.setdefault(device.province_id, []).append(device)

    provinces = db.query(Province).order_by(Province.name_ar).all()
    scope, _ = _scope_label(db, user, directorate_id)

    province_stats: List[ProvinceDashboardStats] = []
    for province in provinces:
        prov_devices = grouped.get(province.id, [])
        if directorate_id and not prov_devices:
            continue
        working = sum(1 for d in prov_devices if d.status == DeviceStatus.WORKING)
        total = len(prov_devices)
        consumed = total - working
        readiness = round((working / total * 100) if total else 0, 1)

        province_stats.append(
            ProvinceDashboardStats(
                province_id=province.id,
                province_name=province.name_ar,
                province_code=province.code,
                total=total,
                working=working,
                consumed=consumed,
                readiness_ratio=readiness,
                by_type=_type_breakdown(prov_devices),
                devices=[_device_row(d) for d in prov_devices],
            )
        )

    national_total = len(devices)
    national_working = sum(1 for d in devices if d.status == DeviceStatus.WORKING)
    national_consumed = national_total - national_working
    national_readiness = round((national_working / national_total * 100) if national_total else 0, 1)

    return ProvincesOverview(
        scope=scope,
        national_total=national_total,
        national_working=national_working,
        national_consumed=national_consumed,
        national_readiness=national_readiness,
        provinces=province_stats,
    )
