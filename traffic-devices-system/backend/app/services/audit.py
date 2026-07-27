import json
from pathlib import Path
from typing import Optional

from sqlalchemy.orm import Session

from app.models import AuditAction, AuditLog, User

UPLOAD_ROOT = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR = UPLOAD_ROOT / "official_books"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def save_book_image(file_content: bytes, filename: str) -> tuple[str, str]:
    import uuid
    ext = Path(filename).suffix.lower() or ".jpg"
    safe_name = f"{uuid.uuid4().hex}{ext}"
    path = UPLOAD_DIR / safe_name
    path.write_bytes(file_content)
    rel_path = f"uploads/official_books/{safe_name}"
    return rel_path, filename


def log_audit(
    db: Session,
    user: User,
    action: AuditAction,
    entity_type: str,
    entity_id: Optional[int],
    entity_label: str,
    changes_summary: str,
    directorate_id: Optional[int] = None,
    official_book_number: Optional[str] = None,
    book_image_path: Optional[str] = None,
    book_image_filename: Optional[str] = None,
) -> AuditLog:
    entry = AuditLog(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_label=entity_label,
        changes_summary=changes_summary,
        directorate_id=directorate_id or user.directorate_id,
        user_id=user.id,
        official_book_number=official_book_number,
        book_image_path=book_image_path,
        book_image_filename=book_image_filename,
    )
    db.add(entry)
    return entry


def summarize_changes(old: dict, new: dict) -> str:
    changes = []
    for key, val in new.items():
        old_val = old.get(key)
        if old_val != val:
            changes.append(f"{key}: {old_val} → {val}")
    return "; ".join(changes) if changes else "تحديث بيانات"
