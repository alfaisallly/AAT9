from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.auth import get_current_user, require_roles
from app.models import User, UserRole
from app.schemas import UploadResponse
from app.services.audit import save_book_image

router = APIRouter(prefix="/uploads", tags=["رفع الملفات"])

ALLOWED = {".jpg", ".jpeg", ".png", ".pdf", ".webp"}
MAX_SIZE = 10 * 1024 * 1024


@router.post("/official-book", response_model=UploadResponse)
async def upload_official_book(
    file: UploadFile = File(...),
    user: User = Depends(require_roles(
        UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.LIAISON, UserRole.OPERATOR
    )),
):
    ext = "." + (file.filename or "").split(".")[-1].lower() if "." in (file.filename or "") else ""
    if ext not in ALLOWED:
        raise HTTPException(status_code=400, detail="الصيغ المسموحة: JPG, PNG, PDF, WEBP")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="حجم الملف يجب ألا يتجاوز 10MB")

    path, orig_name = save_book_image(content, file.filename or "book.jpg")
    return UploadResponse(path=path, filename=orig_name, url=f"/{path}")
