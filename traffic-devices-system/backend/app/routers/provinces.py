from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Province, User
from app.schemas import ProvinceResponse

router = APIRouter(prefix="/provinces", tags=["المحافظات"])


@router.get("/", response_model=List[ProvinceResponse])
def list_provinces(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return (
        db.query(Province)
        .order_by(Province.is_baghdad.desc(), Province.name_ar)
        .all()
    )
