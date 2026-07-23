from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models import BookType, DeviceStatus, DeviceType, MovementType, UserRole


# Auth
class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    username: str
    password: str


# User
class UserBase(BaseModel):
    username: str
    full_name: str
    email: Optional[str] = None
    role: UserRole = UserRole.OPERATOR
    province_id: Optional[int] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(min_length=6)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None
    province_id: Optional[int] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Province
class ProvinceResponse(BaseModel):
    id: int
    name_ar: str
    code: str
    is_baghdad: bool

    class Config:
        from_attributes = True


# Brand
class BrandBase(BaseModel):
    name: str
    name_ar: str


class BrandCreate(BrandBase):
    pass


class BrandResponse(BrandBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True


# Device Model
class DeviceModelBase(BaseModel):
    brand_id: int
    name: str
    device_type: DeviceType


class DeviceModelCreate(DeviceModelBase):
    pass


class DeviceModelResponse(DeviceModelBase):
    id: int
    is_active: bool
    brand: Optional[BrandResponse] = None

    class Config:
        from_attributes = True


# Device
class DeviceBase(BaseModel):
    serial_number: str
    asset_number: Optional[str] = None
    model_id: int
    province_id: int
    status: DeviceStatus = DeviceStatus.WORKING
    device_type: DeviceType
    location: Optional[str] = None
    department: Optional[str] = None
    assigned_to: Optional[str] = None
    condition_notes: Optional[str] = None
    notes: Optional[str] = None
    purchase_date: Optional[date] = None
    received_date: Optional[date] = None
    warranty_expiry: Optional[date] = None


class DeviceCreate(DeviceBase):
    pass


class DeviceUpdate(BaseModel):
    serial_number: Optional[str] = None
    asset_number: Optional[str] = None
    model_id: Optional[int] = None
    province_id: Optional[int] = None
    status: Optional[DeviceStatus] = None
    device_type: Optional[DeviceType] = None
    location: Optional[str] = None
    department: Optional[str] = None
    assigned_to: Optional[str] = None
    condition_notes: Optional[str] = None
    notes: Optional[str] = None
    purchase_date: Optional[date] = None
    received_date: Optional[date] = None
    warranty_expiry: Optional[date] = None


class DeviceResponse(DeviceBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model: Optional[DeviceModelResponse] = None
    province: Optional[ProvinceResponse] = None

    class Config:
        from_attributes = True


# Inventory Movement
class InventoryMovementBase(BaseModel):
    device_id: int
    movement_type: MovementType
    movement_date: date
    province_id: int
    from_entity: Optional[str] = None
    to_entity: Optional[str] = None
    reference_number: Optional[str] = None
    previous_status: Optional[DeviceStatus] = None
    new_status: Optional[DeviceStatus] = None
    notes: Optional[str] = None


class InventoryMovementCreate(InventoryMovementBase):
    update_device_status: bool = False


class InventoryMovementResponse(InventoryMovementBase):
    id: int
    created_at: datetime
    device: Optional[DeviceResponse] = None
    province: Optional[ProvinceResponse] = None

    class Config:
        from_attributes = True


# Official Book
class BookDeviceItemBase(BaseModel):
    device_id: int
    quantity: int = 1
    notes: Optional[str] = None


class BookDeviceItemResponse(BookDeviceItemBase):
    id: int
    device: Optional[DeviceResponse] = None

    class Config:
        from_attributes = True


class OfficialBookBase(BaseModel):
    book_number: str
    book_type: BookType
    book_date: date
    province_id: int
    subject: str
    from_entity: str
    to_entity: str
    notes: Optional[str] = None


class OfficialBookCreate(OfficialBookBase):
    device_items: List[BookDeviceItemBase] = []


class OfficialBookUpdate(BaseModel):
    book_number: Optional[str] = None
    book_type: Optional[BookType] = None
    book_date: Optional[date] = None
    province_id: Optional[int] = None
    subject: Optional[str] = None
    from_entity: Optional[str] = None
    to_entity: Optional[str] = None
    notes: Optional[str] = None
    device_items: Optional[List[BookDeviceItemBase]] = None


class OfficialBookResponse(OfficialBookBase):
    id: int
    created_at: datetime
    province: Optional[ProvinceResponse] = None
    device_items: List[BookDeviceItemResponse] = []

    class Config:
        from_attributes = True


# Dashboard
class DashboardStats(BaseModel):
    total_devices: int
    working_devices: int
    consumed_non_disabled: int
    consumed_disabled: int
    total_books: int
    receipt_books: int
    delivery_books: int
    devices_by_type: dict
    devices_by_province: List[dict]
