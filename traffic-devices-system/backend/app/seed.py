from sqlalchemy.orm import Session

from app.auth import get_password_hash
from app.models import (
    Brand,
    DeviceModel,
    DeviceType,
    Directorate,
    DirectorateType,
    Province,
    User,
    UserRole,
)

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

DIRECTORATES = [
    ("مديرية المرور العامة - المقر", "HQ", DirectorateType.CENTRAL, None),
    ("مديرية مرور بغداد - الكرخ", "BGD-K", DirectorateType.BAGHDAD_KARKH, "BGD"),
    ("مديرية مرور بغداد - الرصافة", "BGD-R", DirectorateType.BAGHDAD_RUSAFA, "BGD"),
    ("مديرية مرور البصرة", "BSR-D", DirectorateType.PROVINCE, "BSR"),
    ("مديرية مرور نينوى", "NIN-D", DirectorateType.PROVINCE, "NIN"),
    ("مديرية مرور الأنبار", "ANB-D", DirectorateType.PROVINCE, "ANB"),
    ("مديرية مرور ديالى", "DIA-D", DirectorateType.PROVINCE, "DIA"),
    ("مديرية مرور كركوك", "KRK-D", DirectorateType.PROVINCE, "KRK"),
    ("مديرية مرور صلاح الدين", "SAL-D", DirectorateType.PROVINCE, "SAL"),
    ("مديرية مرور بابل", "BAB-D", DirectorateType.PROVINCE, "BAB"),
    ("مديرية مرور كربلاء", "KAR-D", DirectorateType.PROVINCE, "KAR"),
    ("مديرية مرور النجف", "NAJ-D", DirectorateType.PROVINCE, "NAJ"),
    ("مديرية مرور واسط", "WAS-D", DirectorateType.PROVINCE, "WAS"),
    ("مديرية مرور ميسان", "MAY-D", DirectorateType.PROVINCE, "MAY"),
    ("مديرية مرور ذي قار", "DHI-D", DirectorateType.PROVINCE, "DHI"),
    ("مديرية مرور المثنى", "MUT-D", DirectorateType.PROVINCE, "MUT"),
    ("مديرية مرور القادسية", "QAD-D", DirectorateType.PROVINCE, "QAD"),
]

DEFAULT_BRANDS = [
    ("Hytera", "هايتيرا"),
    ("Sepura", "سيبورا"),
    ("Motorola", "موتورلا"),
    ("Tetra", "تترا"),
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
    ("Tetra", "TH1n", DeviceType.MOBILE),
    ("Tetra", "TMR880i", DeviceType.WHEEL),
    ("Tetra", "TB3p", DeviceType.DESKTOP),
]


def seed_database(db: Session) -> None:
    if db.query(Province).count() == 0:
        for name_ar, code, is_baghdad in IRAQI_PROVINCES:
            db.add(Province(name_ar=name_ar, code=code, is_baghdad=is_baghdad))

    db.flush()

    if db.query(Directorate).count() == 0:
        province_map = {p.code: p.id for p in db.query(Province).all()}
        for name_ar, code, dtype, prov_code in DIRECTORATES:
            db.add(Directorate(
                name_ar=name_ar,
                code=code,
                directorate_type=dtype,
                province_id=province_map.get(prov_code) if prov_code else None,
            ))

    if db.query(Brand).count() == 0:
        for name, name_ar in DEFAULT_BRANDS:
            db.add(Brand(name=name, name_ar=name_ar))
    else:
        existing = {b.name for b in db.query(Brand).all()}
        for name, name_ar in DEFAULT_BRANDS:
            if name not in existing:
                db.add(Brand(name=name, name_ar=name_ar))

    db.flush()

    if db.query(DeviceModel).count() == 0:
        brand_map = {b.name: b.id for b in db.query(Brand).all()}
        for brand_name, model_name, device_type in DEFAULT_MODELS:
            db.add(DeviceModel(
                brand_id=brand_map[brand_name],
                name=model_name,
                device_type=device_type,
            ))

    if db.query(User).filter(User.username == "admin").first() is None:
        hq = db.query(Directorate).filter(Directorate.code == "HQ").first()
        db.add(User(
            username="admin",
            full_name="مدير النظام المركزي",
            email="admin@traffic.iq",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.SUPER_ADMIN,
            directorate_id=hq.id if hq else None,
        ))

    if db.query(User).filter(User.username == "karkh").first() is None:
        karkh = db.query(Directorate).filter(Directorate.code == "BGD-K").first()
        db.add(User(
            username="karkh",
            full_name="مدير مديرية مرور الكرخ",
            hashed_password=get_password_hash("karkh123"),
            role=UserRole.MANAGER,
            directorate_id=karkh.id if karkh else None,
            province_id=karkh.province_id if karkh else None,
        ))

    db.commit()
