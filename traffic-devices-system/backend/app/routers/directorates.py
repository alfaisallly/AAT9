from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user
from app.database import get_db
from app.models import Directorate, Province, User
from app.schemas import DirectorateResponse

router = APIRouter(prefix="/directorates", tags=["المديريات"])


@router.get("/", response_model=List[DirectorateResponse])
def list_directorates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(Directorate)
        .options(joinedload(Directorate.province))
        .filter(Directorate.is_active == True)
    )
    from app.services.scope import is_central_user

    if not is_central_user(current_user) and current_user.directorate_id:
        query = query.filter(Directorate.id == current_user.directorate_id)

    return query.order_by(Directorate.id).all()
