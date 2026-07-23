from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models import BookType, DeviceStatus, DeviceType, DocumentType, MovementType, SearchType, UserRole


class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    username: str
    password: str


class ProvinceResponse(BaseModel):
    id: int
    name_ar: str
    code: str
    is_baghdad: bool

    class Config:
        from_attributes = True


class DirectorateResponse(BaseModel):
    id: int
    name_ar: str
    code: str
    directorate_type: str
    province_id: Optional[int] = None
    is_active: bool
    province: Optional[ProvinceResponse] = None

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    username: str
    full_name: str
    email: Optional[str] = None
    role: UserRole = UserRole.OPERATOR
    province_id: Optional[int] = None
    directorate_id: Optional[int] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(min_length=6)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None
    province_id: Optional[int] = None
    directorate_id: Optional[int] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    id: int
    created_at: datetime
    directorate: Optional[DirectorateResponse] = None

    class Config:
        from_attributes = True


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


class DeviceDocumentBase(BaseModel):
    document_type: DocumentType
    document_number: str
    document_date: date
    subject: Optional[str] = None
    from_entity: Optional[str] = None
    to_entity: Optional[str] = None
    notes: Optional[str] = None


class DeviceDocumentCreate(DeviceDocumentBase):
    pass


class DeviceDocumentResponse(DeviceDocumentBase):
    id: int
    device_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class DeviceBase(BaseModel):
    serial_number: str
    manufacturer_serial: Optional[str] = None
    asset_number: Optional[str] = None
    model_id: int
    province_id: int
    directorate_id: Optional[int] = None
    status: DeviceStatus = DeviceStatus.WORKING
    device_type: DeviceType
    workplace: Optional[str] = None
    location: Optional[str] = None
    department: Optional[str] = None
    assigned_to: Optional[str] = None
    condition_notes: Optional[str] = None
    notes: Optional[str] = None
    purchase_date: Optional[date] = None
    received_date: Optional[date] = None
    warranty_expiry: Optional[date] = None


class DeviceCreate(DeviceBase):
    documents: List[DeviceDocumentCreate] = []
    official_book_number: Optional[str] = None
    book_image_path: Optional[str] = None
    book_image_filename: Optional[str] = None


class DeviceUpdate(BaseModel):
    serial_number: Optional[str] = None
    manufacturer_serial: Optional[str] = None
    asset_number: Optional[str] = None
    model_id: Optional[int] = None
    province_id: Optional[int] = None
    directorate_id: Optional[int] = None
    status: Optional[DeviceStatus] = None
    device_type: Optional[DeviceType] = None
    workplace: Optional[str] = None
    location: Optional[str] = None
    department: Optional[str] = None
    assigned_to: Optional[str] = None
    condition_notes: Optional[str] = None
    notes: Optional[str] = None
    purchase_date: Optional[date] = None
    received_date: Optional[date] = None
    warranty_expiry: Optional[date] = None
    official_book_number: Optional[str] = None
    book_image_path: Optional[str] = None
    book_image_filename: Optional[str] = None


class DeviceResponse(DeviceBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model: Optional[DeviceModelResponse] = None
    province: Optional[ProvinceResponse] = None
    directorate: Optional[DirectorateResponse] = None
    documents: List[DeviceDocumentResponse] = []

    class Config:
        from_attributes = True


class InventoryMovementBase(BaseModel):
    device_id: int
    movement_type: MovementType
    movement_date: date
    province_id: int
    directorate_id: Optional[int] = None
    from_entity: Optional[str] = None
    to_entity: Optional[str] = None
    reference_number: Optional[str] = None
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    notes: Optional[str] = None


class InventoryMovementCreate(InventoryMovementBase):
    update_device_status: bool = False


class InventoryMovementResponse(InventoryMovementBase):
    id: int
    created_at: datetime
    device: Optional[DeviceResponse] = None
    province: Optional[ProvinceResponse] = None
    directorate: Optional[DirectorateResponse] = None

    class Config:
        from_attributes = True


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
    directorate_id: Optional[int] = None
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
    directorate_id: Optional[int] = None
    subject: Optional[str] = None
    from_entity: Optional[str] = None
    to_entity: Optional[str] = None
    notes: Optional[str] = None
    device_items: Optional[List[BookDeviceItemBase]] = None


class OfficialBookResponse(OfficialBookBase):
    id: int
    created_at: datetime
    province: Optional[ProvinceResponse] = None
    directorate: Optional[DirectorateResponse] = None
    device_items: List[BookDeviceItemResponse] = []

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    scope: str
    directorate_name: Optional[str] = None
    total_devices: int
    working_devices: int
    consumed_devices: int
    total_books: int
    receipt_books: int
    delivery_books: int
    devices_by_type: dict
    devices_by_workplace: List[dict]
    devices_by_brand: List[dict]
    devices_by_directorate: List[dict]
    readiness_ratio: float


class ReportSummary(BaseModel):
    title: str
    scope: str
    generated_at: datetime
    total_devices: int
    working: int
    consumed: int
    readiness_percent: float
    by_type: List[dict]
    by_brand: List[dict]
    by_workplace: List[dict]
    by_directorate: List[dict]
    by_status: List[dict]


class SearchRequest(BaseModel):
    search_type: SearchType = SearchType.GENERAL
    query: str = ""
    directorate_id: Optional[int] = None


class SearchResult(BaseModel):
    devices: List[DeviceResponse]
    total: int
    search_type: SearchType
    query: str


class SearchLogResponse(BaseModel):
    id: int
    search_type: SearchType
    query_value: str
    directorate_id: Optional[int] = None
    results_count: int
    created_at: datetime
    directorate: Optional[DirectorateResponse] = None

    class Config:
        from_attributes = True


class AuditLogResponse(BaseModel):
    id: int
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    entity_label: Optional[str] = None
    changes_summary: Optional[str] = None
    directorate_id: Optional[int] = None
    official_book_number: Optional[str] = None
    book_image_path: Optional[str] = None
    book_image_filename: Optional[str] = None
    created_at: datetime
    user: Optional[UserResponse] = None
    directorate: Optional[DirectorateResponse] = None

    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    path: str
    filename: str
    url: str
