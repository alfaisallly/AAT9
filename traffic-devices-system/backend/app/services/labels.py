from app.models import BookType, DeviceStatus, DeviceType, DocumentType

DEVICE_TYPE_AR = {
    DeviceType.DESKTOP: "جهاز مكتبي",
    DeviceType.MOBILE: "جهاز محمول",
    DeviceType.WHEEL: "جهاز عجلة",
}

DEVICE_STATUS_AR = {
    DeviceStatus.WORKING: "يصلح للعمل",
    DeviceStatus.CONSUMED: "مستهلك - لا يصلح للعمل",
}

DOCUMENT_TYPE_AR = {
    DocumentType.ACQUISITION: "اشتباك / تمليك",
    DocumentType.RECEIPT: "استلام",
    DocumentType.DELIVERY: "تسليم",
    DocumentType.MAINTENANCE: "صيانة",
    DocumentType.TRANSFER: "نقل",
    DocumentType.DISPOSAL: "إتلاف",
}

BOOK_TYPE_AR = {
    BookType.RECEIPT: "استلام",
    BookType.DELIVERY: "تسليم",
}
