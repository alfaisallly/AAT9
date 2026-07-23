from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user
from app.database import get_db
from app.models import Brand, Device, DeviceModel, DeviceStatus, DeviceType, User
from app.schemas import ReportSummary
from app.services.scope import apply_directorate_scope, is_central_user

router = APIRouter(prefix="/reports", tags=["التقارير"])


def _build_report(db: Session, user: User, directorate_id: Optional[int], title: str) -> ReportSummary:
    query = db.query(Device).options(
        joinedload(Device.model).joinedload(DeviceModel.brand),
        joinedload(Device.directorate),
    )
    query = apply_directorate_scope(query, user, Device, directorate_id)
    devices = query.all()

    total = len(devices)
    working = sum(1 for d in devices if d.status == DeviceStatus.WORKING)
    consumed = total - working
    readiness = round((working / total * 100) if total else 0, 1)

    by_type = {}
    for dt in DeviceType:
        by_type[dt.value] = sum(1 for d in devices if d.device_type == dt)

    brand_counts = {}
    for d in devices:
        brand_name = d.model.brand.name_ar if d.model and d.model.brand else "غير محدد"
        brand_counts[brand_name] = brand_counts.get(brand_name, 0) + 1

    workplace_counts = {}
    for d in devices:
        wp = d.workplace or d.location or "غير محدد"
        workplace_counts[wp] = workplace_counts.get(wp, 0) + 1

    directorate_counts = {}
    for d in devices:
        dir_name = d.directorate.name_ar if d.directorate else "غير محدد"
        directorate_counts[dir_name] = directorate_counts.get(dir_name, 0) + 1

    scope = "مركزي موحد"
    if directorate_id:
        from app.models import Directorate
        dir_obj = db.query(Directorate).filter(Directorate.id == directorate_id).first()
        scope = dir_obj.name_ar if dir_obj else scope
    elif not is_central_user(user) and user.directorate:
        scope = user.directorate.name_ar

    return ReportSummary(
        title=title,
        scope=scope,
        generated_at=datetime.utcnow(),
        total_devices=total,
        working=working,
        consumed=consumed,
        readiness_percent=readiness,
        by_type=[{"name": k, "count": v} for k, v in by_type.items()],
        by_brand=[{"name": k, "count": v} for k, v in sorted(brand_counts.items(), key=lambda x: -x[1])],
        by_workplace=[{"name": k, "count": v} for k, v in sorted(workplace_counts.items(), key=lambda x: -x[1])],
        by_directorate=[{"name": k, "count": v} for k, v in sorted(directorate_counts.items(), key=lambda x: -x[1])],
        by_status=[
            {"name": "يصلح للعمل", "count": working},
            {"name": "مستهلك", "count": consumed},
        ],
    )


@router.get("/summary", response_model=ReportSummary)
def get_summary_report(
    directorate_id: Optional[int] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return _build_report(db, user, directorate_id, "تقرير ملخص الأجهزة اللاسلكية")


@router.get("/central", response_model=ReportSummary)
def get_central_report(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return _build_report(db, user, None, "الموقف الموحد - مديرية المرور العامة")


@router.get("/directorate/{directorate_id}", response_model=ReportSummary)
def get_directorate_report(
    directorate_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from app.services.scope import ensure_directorate_access
    ensure_directorate_access(user, directorate_id)
    return _build_report(db, user, directorate_id, "تقرير المديرية")


@router.get("/brands")
def get_brands_report(
    directorate_id: Optional[int] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = (
        db.query(Brand.name_ar, func.count(Device.id).label("count"))
        .join(DeviceModel, DeviceModel.brand_id == Brand.id)
        .join(Device, Device.model_id == DeviceModel.id)
    )
    if directorate_id and is_central_user(db.bind and user):
        query = query.filter(Device.directorate_id == directorate_id)
    elif not is_central_user(user) and user.directorate_id:
        query = query.filter(Device.directorate_id == user.directorate_id)
    elif directorate_id:
        query = query.filter(Device.directorate_id == directorate_id)

    rows = query.group_by(Brand.id, Brand.name_ar).order_by(func.count(Device.id).desc()).all()
    return [{"brand": r.name_ar, "count": r.count} for r in rows]
