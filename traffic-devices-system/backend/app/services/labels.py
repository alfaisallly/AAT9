from app.models import BookType, DeviceStatus, DeviceType

DEVICE_TYPE_AR = {
    DeviceType.DESKTOP: "جهاز مكتبي",
    DeviceType.MOBILE: "جهاز محمول",
    DeviceType.WHEEL: "جهاز عجلة",
}

DEVICE_STATUS_AR = {
    DeviceStatus.WORKING: "يعمل",
    DeviceStatus.CONSUMED_NON_DISABLED: "مستهلك غير معطل",
    DeviceStatus.CONSUMED_DISABLED: "مستهلك معطل",
}

BOOK_TYPE_AR = {
    BookType.RECEIPT: "استلام",
    BookType.DELIVERY: "تسليم",
}
