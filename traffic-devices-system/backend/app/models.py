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
    ADMIN = "admin"
    MANAGER = "manager"
    OPERATOR = "operator"


class DeviceType(str, enum.Enum):
    DESKTOP = "desktop"
    MOBILE = "mobile"
    WHEEL = "wheel"


class DeviceStatus(str, enum.Enum):
    WORKING = "working"
    CONSUMED_NON_DISABLED = "consumed_non_disabled"
    CONSUMED_DISABLED = "consumed_disabled"


class MovementType(str, enum.Enum):
    IN = "in"
    OUT = "out"
    TRANSFER = "transfer"
    STATUS_CHANGE = "status_change"


class BookType(str, enum.Enum):
    RECEIPT = "receipt"
    DELIVERY = "delivery"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.OPERATOR, nullable=False)
    province_id = Column(Integer, ForeignKey("provinces.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    province = relationship("Province", back_populates="users")


class Province(Base):
    __tablename__ = "provinces"

    id = Column(Integer, primary_key=True, index=True)
    name_ar = Column(String(100), unique=True, nullable=False)
    code = Column(String(10), unique=True, nullable=False)
    is_baghdad = Column(Boolean, default=False)

    users = relationship("User", back_populates="province")
    devices = relationship("Device", back_populates="province")
    official_books = relationship("OfficialBook", back_populates="province")


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
    asset_number = Column(String(100), unique=True, nullable=True)
    model_id = Column(Integer, ForeignKey("device_models.id"), nullable=False)
    province_id = Column(Integer, ForeignKey("provinces.id"), nullable=False)
    status = Column(Enum(DeviceStatus), default=DeviceStatus.WORKING, nullable=False)
    device_type = Column(Enum(DeviceType), nullable=False)
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
    province = relationship("Province", back_populates="devices")
    created_by = relationship("User")
    book_items = relationship("BookDeviceItem", back_populates="device")
    movements = relationship("InventoryMovement", back_populates="device")


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    movement_type = Column(Enum(MovementType), nullable=False)
    movement_date = Column(Date, nullable=False)
    province_id = Column(Integer, ForeignKey("provinces.id"), nullable=False)
    from_entity = Column(String(200), nullable=True)
    to_entity = Column(String(200), nullable=True)
    reference_number = Column(String(100), nullable=True)
    previous_status = Column(Enum(DeviceStatus), nullable=True)
    new_status = Column(Enum(DeviceStatus), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    device = relationship("Device", back_populates="movements")
    province = relationship("Province")
    created_by = relationship("User")


class OfficialBook(Base):
    __tablename__ = "official_books"

    id = Column(Integer, primary_key=True, index=True)
    book_number = Column(String(100), unique=True, nullable=False, index=True)
    book_type = Column(Enum(BookType), nullable=False)
    book_date = Column(Date, nullable=False)
    province_id = Column(Integer, ForeignKey("provinces.id"), nullable=False)
    subject = Column(String(300), nullable=False)
    from_entity = Column(String(200), nullable=False)
    to_entity = Column(String(200), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    province = relationship("Province", back_populates="official_books")
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
