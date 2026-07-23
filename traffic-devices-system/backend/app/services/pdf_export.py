from io import BytesIO
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.orm import Session, joinedload

from app.models import BookDeviceItem, Device, DeviceModel, OfficialBook, Province
from app.services.labels import BOOK_TYPE_AR, DEVICE_STATUS_AR, DEVICE_TYPE_AR


def _ar(text: str) -> str:
    try:
        import arabic_reshaper
        from bidi.algorithm import get_display

        return get_display(arabic_reshaper.reshape(str(text)))
    except Exception:
        return str(text)


def _build_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="ArabicTitle",
        fontName="Helvetica-Bold",
        fontSize=16,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1A5276"),
        spaceAfter=12,
    ))
    styles.add(ParagraphStyle(
        name="ArabicSubtitle",
        fontName="Helvetica",
        fontSize=11,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#5D6D7E"),
        spaceAfter=20,
    ))
    styles.add(ParagraphStyle(
        name="ArabicRight",
        fontName="Helvetica",
        fontSize=10,
        alignment=TA_RIGHT,
        leading=16,
    ))
    styles.add(ParagraphStyle(
        name="ArabicLabel",
        fontName="Helvetica-Bold",
        fontSize=10,
        alignment=TA_RIGHT,
        textColor=colors.HexColor("#1A5276"),
    ))
    return styles


def _make_table(data, col_widths=None):
    table = Table(data, colWidths=col_widths, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1A5276")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D5DBDB")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8F9FA")]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return table


def generate_book_pdf(db: Session, book_id: int) -> BytesIO:
    book = (
        db.query(OfficialBook)
        .options(joinedload(OfficialBook.province))
        .options(
            joinedload(OfficialBook.device_items)
            .joinedload(BookDeviceItem.device)
            .joinedload(Device.model)
            .joinedload(DeviceModel.brand)
        )
        .filter(OfficialBook.id == book_id)
        .first()
    )
    if not book:
        raise ValueError("الكتاب غير موجود")

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )
    styles = _build_styles()
    elements = []

    elements.append(Paragraph(_ar("جمهورية العراق"), styles["ArabicSubtitle"]))
    elements.append(Paragraph(_ar("مديرية المرور العامة"), styles["ArabicTitle"]))
    elements.append(Paragraph(
        _ar(f"كتاب رسمي - {BOOK_TYPE_AR.get(book.book_type, '')}"),
        styles["ArabicSubtitle"],
    ))
    elements.append(Spacer(1, 0.5 * cm))

    info_data = [
        [_ar("رقم الكتاب"), _ar(book.book_number), _ar("التاريخ"), _ar(str(book.book_date))],
        [_ar("المحافظة"), _ar(book.province.name_ar if book.province else ""), _ar("النوع"), _ar(BOOK_TYPE_AR.get(book.book_type, ""))],
        [_ar("من"), _ar(book.from_entity), _ar("إلى"), _ar(book.to_entity)],
        [_ar("الموضوع"), _ar(book.subject), "", ""],
    ]
    info_table = Table(info_data, colWidths=[3 * cm, 6 * cm, 3 * cm, 6 * cm])
    info_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (0, 0), (-1, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("SPAN", (1, 3), (3, 3)),
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EBF5FB")),
        ("BACKGROUND", (2, 0), (2, -1), colors.HexColor("#EBF5FB")),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#1A5276")),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#D5DBDB")),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 0.8 * cm))

    if book.device_items:
        elements.append(Paragraph(_ar("قائمة الأجهزة"), styles["ArabicLabel"]))
        elements.append(Spacer(1, 0.3 * cm))

        device_data = [[
            _ar("م"),
            _ar("الرقم التسلسلي"),
            _ar("نوع الجهاز"),
            _ar("الشركة"),
            _ar("الموديل"),
            _ar("الكمية"),
        ]]
        for idx, item in enumerate(book.device_items, 1):
            device = item.device
            device_data.append([
                str(idx),
                _ar(device.serial_number if device else ""),
                _ar(DEVICE_TYPE_AR.get(device.device_type, "") if device else ""),
                _ar(device.model.brand.name_ar if device and device.model and device.model.brand else ""),
                _ar(device.model.name if device and device.model else ""),
                str(item.quantity),
            ])
        elements.append(_make_table(device_data, col_widths=[1.2 * cm, 3.5 * cm, 3 * cm, 3 * cm, 3 * cm, 2 * cm]))

    if book.notes:
        elements.append(Spacer(1, 0.8 * cm))
        elements.append(Paragraph(_ar(f"ملاحظات: {book.notes}"), styles["ArabicRight"]))

    elements.append(Spacer(1, 2 * cm))
    sig_data = [
        [_ar("توقيع المُسلِّم"), "", _ar("توقيع المستلِم"), ""],
        [_ar("الاسم: _______________"), "", _ar("الاسم: _______________"), ""],
        [_ar("التاريخ: _______________"), "", _ar("التاريخ: _______________"), ""],
    ]
    sig_table = Table(sig_data, colWidths=[4.5 * cm, 4.5 * cm, 4.5 * cm, 4.5 * cm])
    sig_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
    ]))
    elements.append(sig_table)

    doc.build(elements)
    buffer.seek(0)
    return buffer


def generate_dashboard_pdf(db: Session, province_id: Optional[int] = None) -> BytesIO:
    from sqlalchemy import func

    from app.models import BookType, DeviceStatus, DeviceType, OfficialBook

    device_query = db.query(Device)
    book_query = db.query(OfficialBook)
    province_name = _ar("جميع المحافظات")

    if province_id:
        device_query = device_query.filter(Device.province_id == province_id)
        book_query = book_query.filter(OfficialBook.province_id == province_id)
        province = db.query(Province).filter(Province.id == province_id).first()
        if province:
            province_name = _ar(province.name_ar)

    total_devices = device_query.count()
    working = device_query.filter(Device.status == DeviceStatus.WORKING).count()
    consumed_ok = device_query.filter(Device.status == DeviceStatus.CONSUMED_NON_DISABLED).count()
    consumed_bad = device_query.filter(Device.status == DeviceStatus.CONSUMED_DISABLED).count()
    total_books = book_query.count()
    receipt = book_query.filter(OfficialBook.book_type == BookType.RECEIPT).count()
    delivery = book_query.filter(OfficialBook.book_type == BookType.DELIVERY).count()

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2 * cm, leftMargin=2 * cm, topMargin=2 * cm, bottomMargin=2 * cm)
    styles = _build_styles()
    elements = []

    elements.append(Paragraph(_ar("تقرير إحصائي"), styles["ArabicTitle"]))
    elements.append(Paragraph(_ar("نظام إدارة أجهزة الاتصالات - مديرية المرور"), styles["ArabicSubtitle"]))
    elements.append(Paragraph(_ar(f"المحافظة: {province_name}"), styles["ArabicRight"]))
    elements.append(Spacer(1, 0.5 * cm))

    stats_data = [
        [_ar("البيان"), _ar("العدد")],
        [_ar("إجمالي الأجهزة"), str(total_devices)],
        [_ar("أجهزة تعمل"), str(working)],
        [_ar("مستهلك غير معطل"), str(consumed_ok)],
        [_ar("مستهلك معطل"), str(consumed_bad)],
        [_ar("إجمالي الكتب الرسمية"), str(total_books)],
        [_ar("كتب استلام"), str(receipt)],
        [_ar("كتب تسليم"), str(delivery)],
    ]
    elements.append(_make_table(stats_data, col_widths=[10 * cm, 6 * cm]))
    elements.append(Spacer(1, 1 * cm))

    type_data = [[_ar("نوع الجهاز"), _ar("العدد")]]
    for dt in DeviceType:
        count = device_query.filter(Device.device_type == dt).count()
        type_data.append([_ar(DEVICE_TYPE_AR[dt]), str(count)])
    elements.append(Paragraph(_ar("الأجهزة حسب النوع"), styles["ArabicLabel"]))
    elements.append(Spacer(1, 0.3 * cm))
    elements.append(_make_table(type_data, col_widths=[10 * cm, 6 * cm]))
    elements.append(Spacer(1, 1 * cm))

    province_stats = (
        db.query(Province.name_ar, func.count(Device.id).label("count"))
        .outerjoin(Device, Device.province_id == Province.id)
        .group_by(Province.id, Province.name_ar)
        .order_by(func.count(Device.id).desc())
        .all()
    )
    prov_data = [[_ar("المحافظة"), _ar("عدد الأجهزة")]]
    for row in province_stats:
        prov_data.append([_ar(row.name_ar), str(row.count)])
    elements.append(Paragraph(_ar("الأجهزة حسب المحافظة"), styles["ArabicLabel"]))
    elements.append(Spacer(1, 0.3 * cm))
    elements.append(_make_table(prov_data, col_widths=[10 * cm, 6 * cm]))

    doc.build(elements)
    buffer.seek(0)
    return buffer


def generate_devices_pdf(
    db: Session,
    province_id: Optional[int] = None,
    status: Optional[str] = None,
    device_type: Optional[str] = None,
) -> BytesIO:
    query = (
        db.query(Device)
        .options(joinedload(Device.model).joinedload(DeviceModel.brand))
        .options(joinedload(Device.province))
    )
    if province_id:
        query = query.filter(Device.province_id == province_id)
    if status:
        query = query.filter(Device.status == status)
    if device_type:
        query = query.filter(Device.device_type == device_type)

    devices = query.order_by(Device.id).all()

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=1.5 * cm, leftMargin=1.5 * cm, topMargin=2 * cm, bottomMargin=2 * cm)
    styles = _build_styles()
    elements = []

    elements.append(Paragraph(_ar("تقرير الأجهزة"), styles["ArabicTitle"]))
    elements.append(Paragraph(_ar("مديرية المرور - نظام إدارة أجهزة الاتصالات"), styles["ArabicSubtitle"]))
    elements.append(Spacer(1, 0.5 * cm))

    table_data = [[
        _ar("م"),
        _ar("التسلسلي"),
        _ar("النوع"),
        _ar("الموديل"),
        _ar("المحافظة"),
        _ar("الحالة"),
    ]]
    for idx, d in enumerate(devices, 1):
        table_data.append([
            str(idx),
            _ar(d.serial_number),
            _ar(DEVICE_TYPE_AR.get(d.device_type, "")),
            _ar(f"{d.model.brand.name_ar} {d.model.name}" if d.model and d.model.brand else ""),
            _ar(d.province.name_ar if d.province else ""),
            _ar(DEVICE_STATUS_AR.get(d.status, "")),
        ])

    elements.append(_make_table(
        table_data,
        col_widths=[1 * cm, 3.5 * cm, 2.5 * cm, 4 * cm, 2.5 * cm, 3 * cm],
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer
