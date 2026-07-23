import json
from datetime import datetime
from io import BytesIO
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user
from app.database import get_db
from app.models import Device, DeviceModel, SearchLog, SearchType, User
from app.schemas import DeviceResponse, SearchLogResponse, SearchRequest, SearchResult
from app.services.scope import apply_directorate_scope, ensure_directorate_access

router = APIRouter(prefix="/search", tags=["البحث"])


def _log_search(db: Session, user: User, search_type: SearchType, query_value: str,
                directorate_id: Optional[int], count: int) -> SearchLog:
    log = SearchLog(
        search_type=search_type,
        query_value=query_value,
        directorate_id=directorate_id,
        results_count=count,
        user_id=user.id,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def _device_query(db: Session, user: User, directorate_id: Optional[int] = None):
    query = (
        db.query(Device)
        .options(joinedload(Device.model).joinedload(DeviceModel.brand))
        .options(joinedload(Device.province))
        .options(joinedload(Device.directorate))
        .options(joinedload(Device.documents))
    )
    return apply_directorate_scope(query, user, Device, directorate_id)


@router.post("/", response_model=SearchResult)
def search_devices(
    req: SearchRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = _device_query(db, user, req.directorate_id)
    label = req.query

    if req.search_type == SearchType.ASSET_NUMBER:
        query = query.filter(Device.asset_number.ilike(f"%{req.query}%"))
        label = f"رقم أميني: {req.query}"
    elif req.search_type == SearchType.DIRECTORATE:
        if not req.directorate_id:
            raise HTTPException(status_code=400, detail="يجب تحديد المديرية")
        ensure_directorate_access(user, req.directorate_id)
        query = query.filter(Device.directorate_id == req.directorate_id)
        from app.models import Directorate
        d = db.query(Directorate).filter(Directorate.id == req.directorate_id).first()
        label = d.name_ar if d else str(req.directorate_id)
    else:
        like = f"%{req.query}%"
        query = query.filter(
            (Device.serial_number.ilike(like))
            | (Device.manufacturer_serial.ilike(like))
            | (Device.asset_number.ilike(like))
            | (Device.workplace.ilike(like))
        )

    results = query.order_by(Device.id.desc()).all()
    _log_search(db, user, req.search_type, label, req.directorate_id, len(results))
    return SearchResult(devices=results, total=len(results), search_type=req.search_type, query=label)


@router.get("/by-asset/{asset_number}", response_model=SearchResult)
def search_by_asset_number(
    asset_number: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = _device_query(db, user).filter(Device.asset_number.ilike(f"%{asset_number}%"))
    results = query.all()
    _log_search(db, user, SearchType.ASSET_NUMBER, asset_number, None, len(results))
    return SearchResult(devices=results, total=len(results), search_type=SearchType.ASSET_NUMBER, query=asset_number)


@router.get("/by-directorate/{directorate_id}", response_model=SearchResult)
def search_by_directorate(
    directorate_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    ensure_directorate_access(user, directorate_id)
    query = _device_query(db, user, directorate_id).filter(Device.directorate_id == directorate_id)
    results = query.all()
    from app.models import Directorate
    d = db.query(Directorate).filter(Directorate.id == directorate_id).first()
    label = d.name_ar if d else str(directorate_id)
    _log_search(db, user, SearchType.DIRECTORATE, label, directorate_id, len(results))
    return SearchResult(devices=results, total=len(results), search_type=SearchType.DIRECTORATE, query=label)


@router.get("/logs", response_model=List[SearchLogResponse])
def get_search_logs(
    limit: int = Query(50, le=500),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = (
        db.query(SearchLog)
        .options(joinedload(SearchLog.user))
        .options(joinedload(SearchLog.directorate))
        .filter(SearchLog.user_id == user.id)
    )
    return query.order_by(SearchLog.created_at.desc()).limit(limit).all()


@router.get("/logs/export")
def export_search_logs(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    logs = (
        db.query(SearchLog)
        .options(joinedload(SearchLog.directorate))
        .filter(SearchLog.user_id == user.id)
        .order_by(SearchLog.created_at.desc())
        .all()
    )

    wb = Workbook()
    ws = wb.active
    ws.title = "سجل البحث"
    ws.sheet_view.rightToLeft = True
    ws.append(["م", "نوع البحث", "الاستعلام", "المديرية", "النتائج", "التاريخ"])
    for i, log in enumerate(logs, 1):
        ws.append([
            i,
            log.search_type.value,
            log.query_value,
            log.directorate.name_ar if log.directorate else "",
            log.results_count,
            str(log.created_at),
        ])

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    filename = f"search_log_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.delete("/logs")
def clear_search_logs(
    save_before: bool = Query(True, description="حفظ السجل قبل الحذف"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    count = db.query(SearchLog).filter(SearchLog.user_id == user.id).count()
    if count == 0:
        return {"message": "السجل فارغ", "deleted": 0, "saved": False}

    saved = save_before
    db.query(SearchLog).filter(SearchLog.user_id == user.id).delete()
    db.commit()
    return {
        "message": "تم مسح سجل البحث",
        "deleted": count,
        "saved": saved,
        "note": "استخدم export قبل الحذف لحفظ نسخة" if save_before else None,
    }
