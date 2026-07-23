import enum
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MANAGER = "manager"
    LIAISON = "liaison"
    OPERATOR = "operator"


class SearchType(str, enum.Enum):
    MANUFACTURER_SERIAL = "manufacturer_serial"
    DIRECTORATE = "directorate"
    GENERAL = "general"
    # legacy alias kept for reading old search logs
    ASSET_NUMBER = "asset_number"


class AuditAction(str, enum.Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    SEARCH = "search"


class DirectorateType(str, enum.Enum):
    CENTRAL = "central"
    BAGHDAD_KARKH = "baghdad_karkh"
    BAGHDAD_RUSAFA = "baghdad_rusafa"
    PROVINCE = "province"


class DeviceType(str, enum.Enum):
    DESKTOP = "desktop"
    MOBILE = "mobile"
    WHEEL = "wheel"


class DeviceStatus(str, enum.Enum):
    WORKING = "working"
    CONSUMED = "consumed"


class DocumentType(str, enum.Enum):
    ACQUISITION = "acquisition"
    RECEIPT = "receipt"
    DELIVERY = "delivery"
    MAINTENANCE = "maintenance"
    TRANSFER = "transfer"
    DISPOSAL = "disposal"


class MovementType(str, enum.Enum):
    IN = "in"
    OUT = "out"
    TRANSFER = "transfer"
    STATUS_CHANGE = "status_change"


class BookType(str, enum.Enum):
    RECEIPT = "receipt"
    DELIVERY = "delivery"


class Province(Base):
    __tablename__ = "provinces"

    id = Column(Integer, primary_key=True, index=True)
    name_ar = Column(String(100), unique=True, nullable=False)
    code = Column(String(10), unique=True, nullable=False)
    is_baghdad = Column(Boolean, default=False)

    directorates = relationship("Directorate", back_populates="province")
    users = relationship("User", back_populates="province")


class Directorate(Base):
    __tablename__ = "directorates"

    id = Column(Integer, primary_key=True, index=True)
    name_ar = Column(String(200), unique=True, nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    directorate_type = Column(Enum(DirectorateType), nullable=False)
    province_id = Column(Integer, ForeignKey("provinces.id"), nullable=True)
    is_active = Column(Boolean, default=True)

    province = relationship("Province", back_populates="directorates")
    users = relationship("User", back_populates="directorate")
    devices = relationship("Device", back_populates="directorate")
    official_books = relationship("OfficialBook", back_populates="directorate")
    movements = relationship("InventoryMovement", back_populates="directorate")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.OPERATOR, nullable=False)
    province_id = Column(Integer, ForeignKey("provinces.id"), nullable=True)
    directorate_id = Column(Integer, ForeignKey("directorates.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    province = relationship("Province", back_populates="users")
    directorate = relationship("Directorate", back_populates="users")


class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    name_ar = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)

    models = relationship("DeviceModel", back_populates="brand")


class DeviceModel(Base):
    __tablename__ = "device_models"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False)
    name = Column(String(100), nullable=False)
    device_type = Column(Enum(DeviceType), nullable=False)
    is_active = Column(Boolean, default=True)

    brand = relationship("Brand", back_populates="models")
    devices = relationship("Device", back_populates="model")


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    serial_number = Column(String(100), unique=True, nullable=False, index=True)
    manufacturer_serial = Column(String(100), nullable=True)
    asset_number = Column(String(100), unique=True, nullable=True)
    model_id = Column(Integer, ForeignKey("device_models.id"), nullable=False)
    province_id = Column(Integer, ForeignKey("provinces.id"), nullable=False)
    directorate_id = Column(Integer, ForeignKey("directorates.id"), nullable=True)
    status = Column(Enum(DeviceStatus), default=DeviceStatus.WORKING, nullable=False)
    device_type = Column(Enum(DeviceType), nullable=False)
    workplace = Column(String(200), nullable=True)
    location = Column(String(200), nullable=True)
    department = Column(String(150), nullable=True)
    assigned_to = Column(String(150), nullable=True)
    condition_notes = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    purchase_date = Column(Date, nullable=True)
    received_date = Column(Date, nullable=True)
    warranty_expiry = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    model = relationship("DeviceModel", back_populates="devices")
    province = relationship("Province")
    directorate = relationship("Directorate", back_populates="devices")
    created_by = relationship("User")
    book_items = relationship("BookDeviceItem", back_populates="device")
    movements = relationship("InventoryMovement", back_populates="device")
    documents = relationship("DeviceDocument", back_populates="device", cascade="all, delete-orphan")


class DeviceDocument(Base):
    __tablename__ = "device_documents"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    document_type = Column(Enum(DocumentType), nullable=False)
    document_number = Column(String(100), nullable=False)
    document_date = Column(Date, nullable=False)
    subject = Column(String(300), nullable=True)
    from_entity = Column(String(200), nullable=True)
    to_entity = Column(String(200), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    device = relationship("Device", back_populates="documents")
    created_by = relationship("User")


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    movement_type = Column(Enum(MovementType), nullable=False)
    movement_date = Column(Date, nullable=False)
    province_id = Column(Integer, ForeignKey("provinces.id"), nullable=False)
    directorate_id = Column(Integer, ForeignKey("directorates.id"), nullable=True)
    from_entity = Column(String(200), nullable=True)
    to_entity = Column(String(200), nullable=True)
    reference_number = Column(String(100), nullable=True)
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    device = relationship("Device", back_populates="movements")
    province = relationship("Province")
    directorate = relationship("Directorate", back_populates="movements")
    created_by = relationship("User")


class OfficialBook(Base):
    __tablename__ = "official_books"

    id = Column(Integer, primary_key=True, index=True)
    book_number = Column(String(100), unique=True, nullable=False, index=True)
    book_type = Column(Enum(BookType), nullable=False)
    book_date = Column(Date, nullable=False)
    province_id = Column(Integer, ForeignKey("provinces.id"), nullable=False)
    directorate_id = Column(Integer, ForeignKey("directorates.id"), nullable=True)
    subject = Column(String(300), nullable=False)
    from_entity = Column(String(200), nullable=False)
    to_entity = Column(String(200), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    province = relationship("Province")
    directorate = relationship("Directorate", back_populates="official_books")
    created_by = relationship("User")
    device_items = relationship("BookDeviceItem", back_populates="book", cascade="all, delete-orphan")


class BookDeviceItem(Base):
    __tablename__ = "book_device_items"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("official_books.id"), nullable=False)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    quantity = Column(Integer, default=1)
    notes = Column(Text, nullable=True)

    book = relationship("OfficialBook", back_populates="device_items")
    device = relationship("Device", back_populates="book_items")


class SearchLog(Base):
    __tablename__ = "search_logs"

    id = Column(Integer, primary_key=True, index=True)
    search_type = Column(Enum(SearchType), nullable=False)
    query_value = Column(String(300), nullable=False)
    directorate_id = Column(Integer, ForeignKey("directorates.id"), nullable=True)
    results_count = Column(Integer, default=0)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    directorate = relationship("Directorate")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(Enum(AuditAction), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=True)
    entity_label = Column(String(200), nullable=True)
    changes_summary = Column(Text, nullable=True)
    directorate_id = Column(Integer, ForeignKey("directorates.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    official_book_number = Column(String(100), nullable=True)
    book_image_path = Column(String(500), nullable=True)
    book_image_filename = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    directorate = relationship("Directorate")

