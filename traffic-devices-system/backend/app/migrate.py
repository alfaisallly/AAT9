from sqlalchemy import inspect, text

from app.database import engine


def migrate_database():
    """Add new columns to existing SQLite tables without losing data."""
    new_device_columns = [
        ("department", "VARCHAR(150)"),
        ("assigned_to", "VARCHAR(150)"),
        ("condition_notes", "TEXT"),
        ("received_date", "DATE"),
        ("warranty_expiry", "DATE"),
    ]

    with engine.connect() as conn:
        inspector = inspect(engine)
        if "devices" in inspector.get_table_names():
            existing = {col["name"] for col in inspector.get_columns("devices")}
            for col_name, col_type in new_device_columns:
                if col_name not in existing:
                    conn.execute(text(f"ALTER TABLE devices ADD COLUMN {col_name} {col_type}"))
            conn.commit()
