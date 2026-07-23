from sqlalchemy.orm import Session

from app.auth import get_password_hash
from app.models import Brand, DeviceModel, DeviceType, Province, User, UserRole

IRAQI_PROVINCES = [
    ("بغداد", "BGD", True),
    ("البصرة", "BSR", False),
    ("نينوى", "NIN", False),
    ("الأنبار", "ANB", False),
    ("ديالى", "DIA", False),
    ("كركوك", "KRK", False),
    ("صلاح الدين", "SAL", False),
    ("بابل", "BAB", False),
    ("كربلاء", "KAR", False),
    ("النجف", "NAJ", False),
    ("واسط", "WAS", False),
    ("ميسان", "MAY", False),
    ("ذي قار", "DHI", False),
    ("المثنى", "MUT", False),
    ("القادسية", "QAD", False),
]

DEFAULT_BRANDS = [
    ("Hytera", "هايتيرا"),
    ("Sepura", "سيبورا"),
    ("Motorola", "موتورلا"),
]

DEFAULT_MODELS = [
    ("Hytera", "HP780", DeviceType.MOBILE),
    ("Hytera", "MD785", DeviceType.WHEEL),
    ("Hytera", "BD505", DeviceType.DESKTOP),
    ("Sepura", "SC20", DeviceType.MOBILE),
    ("Sepura", "SRG3900", DeviceType.WHEEL),
    ("Sepura", "STP9000", DeviceType.DESKTOP),
    ("Motorola", "DP4801", DeviceType.MOBILE),
    ("Motorola", "MTM8000", DeviceType.WHEEL),
    ("Motorola", "MOTOTRBO SLR5500", DeviceType.DESKTOP),
]


def seed_database(db: Session) -> None:
    if db.query(Province).count() == 0:
        for name_ar, code, is_baghdad in IRAQI_PROVINCES:
            db.add(Province(name_ar=name_ar, code=code, is_baghdad=is_baghdad))

    if db.query(Brand).count() == 0:
        for name, name_ar in DEFAULT_BRANDS:
            db.add(Brand(name=name, name_ar=name_ar))

    db.flush()

    if db.query(DeviceModel).count() == 0:
        brand_map = {b.name: b.id for b in db.query(Brand).all()}
        for brand_name, model_name, device_type in DEFAULT_MODELS:
            db.add(
                DeviceModel(
                    brand_id=brand_map[brand_name],
                    name=model_name,
                    device_type=device_type,
                )
            )

    if db.query(User).filter(User.username == "admin").first() is None:
        baghdad = db.query(Province).filter(Province.code == "BGD").first()
        db.add(
            User(
                username="admin",
                full_name="مدير النظام",
                email="admin@traffic.iq",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                province_id=baghdad.id if baghdad else None,
            )
        )

    db.commit()
