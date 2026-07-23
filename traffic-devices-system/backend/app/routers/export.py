from typing import Optional
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import User
from app.services.excel_export import export_books_excel, export_devices_excel
from app.services.pdf_export import generate_book_pdf, generate_dashboard_pdf, generate_devices_pdf

router = APIRouter(prefix="/export", tags=["التصدير والطباعة"])


def _file_response(buffer, filename: str, media_type: str):
    encoded_filename = quote(filename)
    return StreamingResponse(
        buffer,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}",
        },
    )


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
