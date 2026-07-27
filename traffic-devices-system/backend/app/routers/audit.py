from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user, require_roles
from app.database import get_db
from app.models import AuditLog, User, UserRole
from app.schemas import AuditLogResponse
from app.services.scope import apply_directorate_scope, is_central_user

router = APIRouter(prefix="/audit", tags=["سجل التعديلات"])


@router.get("/", response_model=List[AuditLogResponse])
def list_audit_logs(
    directorate_id: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = (
        db.query(AuditLog)
        .options(joinedload(AuditLog.user))
        .options(joinedload(AuditLog.directorate))
    )
    query = apply_directorate_scope(query, user, AuditLog, directorate_id)
    return query.order_by(AuditLog.created_at.desc()).limit(limit).all()


@router.get("/export")
def export_audit_logs(
    directorate_id: Optional[int] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from fastapi.responses import JSONResponse

    query = db.query(AuditLog).options(joinedload(AuditLog.user)).options(joinedload(AuditLog.directorate))
    query = apply_directorate_scope(query, user, AuditLog, directorate_id)
    logs = query.order_by(AuditLog.created_at.desc()).all()

    data = [{
        "id": log.id,
        "action": log.action.value,
        "entity_type": log.entity_type,
        "entity_label": log.entity_label,
        "changes": log.changes_summary,
        "user": log.user.full_name if log.user else None,
        "directorate": log.directorate.name_ar if log.directorate else None,
        "official_book_number": log.official_book_number,
        "book_image": log.book_image_filename,
        "date": log.created_at.isoformat(),
    } for log in logs]

    return JSONResponse(content={"exported_at": __import__("datetime").datetime.utcnow().isoformat(), "records": data})
