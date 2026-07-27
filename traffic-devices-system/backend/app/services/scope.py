from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Query, Session

from app.models import Device, OfficialBook, User, UserRole


def is_central_user(user: User) -> bool:
    return user.role in (UserRole.SUPER_ADMIN, UserRole.ADMIN)


def apply_directorate_scope(
    query: Query,
    user: User,
    model,
    directorate_id: Optional[int] = None,
    force_directorate_id: Optional[int] = None,
) -> Query:
    """Filter query by directorate based on user permissions."""
    if force_directorate_id:
        return query.filter(model.directorate_id == force_directorate_id)

    if directorate_id and is_central_user(user):
        return query.filter(model.directorate_id == directorate_id)

    if not is_central_user(user) and user.directorate_id:
        return query.filter(model.directorate_id == user.directorate_id)

    return query


def ensure_directorate_access(user: User, directorate_id: Optional[int]) -> None:
    if is_central_user(user):
        return
    if user.directorate_id and directorate_id and user.directorate_id != directorate_id:
        raise HTTPException(status_code=403, detail="ليس لديك صلاحية للوصول لهذه المديرية")


def resolve_directorate_id(user: User, requested_directorate_id: Optional[int]) -> Optional[int]:
    if is_central_user(user):
        return requested_directorate_id or user.directorate_id
    return user.directorate_id


def get_device_query(db: Session, user: User, directorate_id: Optional[int] = None) -> Query:
    query = db.query(Device)
    return apply_directorate_scope(query, user, Device, directorate_id)


def get_book_query(db: Session, user: User, directorate_id: Optional[int] = None) -> Query:
    query = db.query(OfficialBook)
    return apply_directorate_scope(query, user, OfficialBook, directorate_id)
