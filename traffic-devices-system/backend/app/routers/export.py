from typing import Optional
from urllib.parse import quote

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_roles
from app.database import get_db
from app.models import User, UserRole
from app.services.excel_export import export_books_excel, export_devices_excel
from app.services.excel_import import import_devices_from_excel
from app.services.excel_template import generate_devices_import_template
from app.services.pdf_export import generate_book_pdf, generate_dashboard_pdf, generate_devices_pdf

router = APIRouter(prefix="/export", tags=["التصدير والطباعة"])

IMPORT_ROLES = (UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.LIAISON, UserRole.OPERATOR)


def _file_response(buffer, filename: str, media_type: str):
    encoded_filename = quote(filename)
    return StreamingResponse(
        buffer,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}",
        },
    )


@router.get("/devices/template")
def download_devices_import_template(
    province: Optional[str] = Query(None, description="اسم المحافظة لملء الحقل تلقائياً"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    buffer = generate_devices_import_template(db, province_hint=province)
    return _file_response(
        buffer,
        "نموذج_جمع_بيانات_الأجهزة_مديرية_المرور.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@router.post("/devices/import")
async def import_devices_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(*IMPORT_ROLES)),
):
    if not file.filename or not file.filename.lower().endswith((".xlsx", ".xlsm")):
        raise HTTPException(status_code=400, detail="يجب رفع ملف Excel بصيغة .xlsx")
    content = await file.read()
    try:
        result = import_devices_from_excel(db, content, user)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return result


@router.get("/devices/excel")
def download_devices_excel(
    province_id: Optional[int] = None,
    status: Optional[str] = None,
    device_type: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    buffer = export_devices_excel(db, province_id, status, device_type)
    return _file_response(buffer, "devices_report.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


@router.get("/devices/pdf")
def download_devices_pdf(
    province_id: Optional[int] = None,
    status: Optional[str] = None,
    device_type: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    buffer = generate_devices_pdf(db, province_id, status, device_type)
    return _file_response(buffer, "devices_report.pdf", "application/pdf")


@router.get("/books/excel")
def download_books_excel(
    province_id: Optional[int] = None,
    book_type: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    buffer = export_books_excel(db, province_id, book_type)
    return _file_response(buffer, "official_books.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


@router.get("/books/{book_id}/pdf")
def print_book_pdf(
    book_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    try:
        buffer = generate_book_pdf(db, book_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return _file_response(buffer, f"book_{book_id}.pdf", "application/pdf")


@router.get("/dashboard/pdf")
def download_dashboard_pdf(
    province_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    buffer = generate_dashboard_pdf(db, province_id)
    return _file_response(buffer, "dashboard_report.pdf", "application/pdf")
