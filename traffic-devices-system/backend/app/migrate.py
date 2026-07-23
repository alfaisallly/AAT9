from sqlalchemy import inspect, text

from app.database import engine


def migrate_database():
    with engine.connect() as conn:
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        if "devices" in tables:
            existing = {col["name"] for col in inspector.get_columns("devices")}
            new_cols = [
                ("manufacturer_serial", "VARCHAR(100)"),
                ("directorate_id", "INTEGER"),
                ("workplace", "VARCHAR(200)"),
                ("department", "VARCHAR(150)"),
                ("assigned_to", "VARCHAR(150)"),
                ("condition_notes", "TEXT"),
                ("received_date", "DATE"),
                ("warranty_expiry", "DATE"),
            ]
            for col_name, col_type in new_cols:
                if col_name not in existing:
                    conn.execute(text(f"ALTER TABLE devices ADD COLUMN {col_name} {col_type}"))

            try:
                conn.execute(text(
                    "UPDATE devices SET status = 'consumed' "
                    "WHERE status IN ('consumed_non_disabled', 'consumed_disabled')"
                ))
            except Exception:
                pass

        for table, cols in [
            ("users", [("directorate_id", "INTEGER")]),
            ("official_books", [("directorate_id", "INTEGER")]),
            ("inventory_movements", [("directorate_id", "INTEGER")]),
        ]:
            if table in tables:
                existing = {col["name"] for col in inspector.get_columns(table)}
                for col_name, col_type in cols:
                    if col_name not in existing:
                        conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}"))

        conn.commit()

    _migrate_directorate_ids()


def _migrate_directorate_ids():
    from app.database import SessionLocal
    from app.models import Device, Directorate, Province

    db = SessionLocal()
    try:
        if db.query(Directorate).count() == 0:
            return

        for device in db.query(Device).filter(Device.directorate_id.is_(None)).all():
            if device.province_id:
                province = db.query(Province).filter(Province.id == device.province_id).first()
                if province and province.code == "BGD":
                    directorate = db.query(Directorate).filter(
                        Directorate.code == "BGD-K"
                    ).first()
                else:
                    directorate = db.query(Directorate).filter(
                        Directorate.province_id == device.province_id,
                        Directorate.directorate_type != "central",
                    ).first()
                if directorate:
                    device.directorate_id = directorate.id
        db.commit()
    finally:
        db.close()
