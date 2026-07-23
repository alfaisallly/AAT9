from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user, require_roles
from app.database import get_db
from app.models import BookDeviceItem, Device, DeviceModel, OfficialBook, User, UserRole
from app.schemas import OfficialBookCreate, OfficialBookResponse, OfficialBookUpdate

router = APIRouter(prefix="/books", tags=["الكتب الرسمية"])


@router.get("/", response_model=List[OfficialBookResponse])
def list_books(
    province_id: Optional[int] = None,
    book_type: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = (
        db.query(OfficialBook)
        .options(joinedload(OfficialBook.province))
        .options(
            joinedload(OfficialBook.device_items)
            .joinedload(BookDeviceItem.device)
            .joinedload(Device.model)
            .joinedload(DeviceModel.brand)
        )
        .options(
            joinedload(OfficialBook.device_items)
            .joinedload(BookDeviceItem.device)
            .joinedload(Device.province)
        )
    )

    if province_id:
        query = query.filter(OfficialBook.province_id == province_id)
    if book_type:
        query = query.filter(OfficialBook.book_type == book_type)

    return query.order_by(OfficialBook.book_date.desc()).all()


@router.post("/", response_model=OfficialBookResponse)
def create_book(
    book_data: OfficialBookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)),
):
    if db.query(OfficialBook).filter(OfficialBook.book_number == book_data.book_number).first():
        raise HTTPException(status_code=400, detail="رقم الكتاب موجود مسبقاً")

    book = OfficialBook(
        book_number=book_data.book_number,
        book_type=book_data.book_type,
        book_date=book_data.book_date,
        province_id=book_data.province_id,
        subject=book_data.subject,
        from_entity=book_data.from_entity,
        to_entity=book_data.to_entity,
        notes=book_data.notes,
        created_by_id=current_user.id,
    )
    db.add(book)
    db.flush()

    for item in book_data.device_items:
        db.add(
            BookDeviceItem(
                book_id=book.id,
                device_id=item.device_id,
                quantity=item.quantity,
                notes=item.notes,
            )
        )

    db.commit()
    return _load_book(db, book.id)


@router.get("/{book_id}", response_model=OfficialBookResponse)
def get_book(
    book_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    book = _load_book(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="الكتاب غير موجود")
    return book


@router.put("/{book_id}", response_model=OfficialBookResponse)
def update_book(
    book_id: int,
    book_data: OfficialBookUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)),
):
    book = db.query(OfficialBook).filter(OfficialBook.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="الكتاب غير موجود")

    update_data = book_data.model_dump(exclude_unset=True)
    device_items = update_data.pop("device_items", None)

    for key, value in update_data.items():
        setattr(book, key, value)

    if device_items is not None:
        db.query(BookDeviceItem).filter(BookDeviceItem.book_id == book_id).delete()
        for item in device_items:
            db.add(
                BookDeviceItem(
                    book_id=book_id,
                    device_id=item["device_id"],
                    quantity=item.get("quantity", 1),
                    notes=item.get("notes"),
                )
            )

    db.commit()
    return _load_book(db, book_id)


@router.delete("/{book_id}")
def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)),
):
    book = db.query(OfficialBook).filter(OfficialBook.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="الكتاب غير موجود")
    db.delete(book)
    db.commit()
    return {"message": "تم حذف الكتاب بنجاح"}


def _load_book(db: Session, book_id: int) -> Optional[OfficialBook]:
    return (
        db.query(OfficialBook)
        .options(joinedload(OfficialBook.province))
        .options(
            joinedload(OfficialBook.device_items)
            .joinedload(BookDeviceItem.device)
            .joinedload(Device.model)
            .joinedload(DeviceModel.brand)
        )
        .options(
            joinedload(OfficialBook.device_items)
            .joinedload(BookDeviceItem.device)
            .joinedload(Device.province)
        )
        .filter(OfficialBook.id == book_id)
        .first()
    )
