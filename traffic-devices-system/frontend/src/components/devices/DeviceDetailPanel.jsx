import { labels, statusBadgeClass } from '../../api';
import { FieldDisplay } from './DeviceFields';

const TYPE_ICONS = { desktop: '🖥️', mobile: '📱', wheel: '🚗' };

export default function DeviceDetailPanel({ device, onClose, onEdit, onDelete, isManager }) {
  if (!device) return null;

  return (
    <div className="detail-panel-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        <div className="detail-panel-header">
          <div className="detail-panel-title">
            <span className="detail-type-icon">{TYPE_ICONS[device.device_type]}</span>
            <div>
              <h3>{device.serial_number}</h3>
              <p>{device.model?.brand?.name_ar} — {device.model?.name}</p>
            </div>
          </div>
          <button className="detail-close" onClick={onClose}>✕</button>
        </div>

        <div className="detail-status-bar">
          <span className={`badge ${statusBadgeClass(device.status)}`}>
            {labels.deviceStatus[device.status]}
          </span>
          <span className="badge badge-info">{labels.deviceTypes[device.device_type]}</span>
          <span className="badge badge-default">{device.province?.name_ar}</span>
        </div>

        <div className="detail-sections">
          <div className="detail-section">
            <h4>🔖 بيانات التعريف</h4>
            <div className="field-display-grid">
              <FieldDisplay label="الرقم التسلسلي" value={device.serial_number} />
              <FieldDisplay label="رقم الأصل" value={device.asset_number} />
            </div>
          </div>

          <div className="detail-section">
            <h4>📍 الموقع والتخصيص</h4>
            <div className="field-display-grid">
              <FieldDisplay label="المحافظة" value={device.province?.name_ar} />
              <FieldDisplay label="الموقع" value={device.location} />
              <FieldDisplay label="القسم" value={device.department} />
              <FieldDisplay label="المسؤول" value={device.assigned_to} />
            </div>
          </div>

          <div className="detail-section">
            <h4>⚙️ الحالة</h4>
            <div className="field-display-grid">
              <FieldDisplay label="حالة الجهاز" value={labels.deviceStatus[device.status]} />
              <FieldDisplay label="وصف الحالة" value={device.condition_notes} fullWidth />
            </div>
          </div>

          <div className="detail-section">
            <h4>📅 التواريخ</h4>
            <div className="field-display-grid">
              <FieldDisplay label="تاريخ الشراء" value={device.purchase_date} />
              <FieldDisplay label="تاريخ الاستلام" value={device.received_date} />
              <FieldDisplay label="انتهاء الضمان" value={device.warranty_expiry} />
              <FieldDisplay label="تاريخ الإنشاء" value={device.created_at?.split('T')[0]} />
            </div>
          </div>

          {device.notes && (
            <div className="detail-section">
              <h4>📝 ملاحظات</h4>
              <p className="detail-notes">{device.notes}</p>
            </div>
          )}
        </div>

        <div className="detail-panel-actions">
          <button className="btn btn-primary" onClick={() => onEdit(device)}>✏️ تعديل</button>
          {isManager && (
            <button className="btn btn-danger" onClick={() => onDelete(device.id)}>🗑️ حذف</button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DeviceCard({ device, onView, onEdit }) {
  return (
    <div className="device-card" onClick={() => onView(device)}>
      <div className="device-card-header">
        <span className="device-card-icon">{TYPE_ICONS[device.device_type]}</span>
        <span className={`badge ${statusBadgeClass(device.status)}`}>
          {labels.deviceStatus[device.status]}
        </span>
      </div>
      <h4 className="device-card-serial">{device.serial_number}</h4>
      <p className="device-card-model">{device.model?.brand?.name_ar} — {device.model?.name}</p>
      <div className="device-card-meta">
        <span>📍 {device.province?.name_ar}</span>
        {device.location && <span>🏢 {device.location}</span>}
        {device.assigned_to && <span>👤 {device.assigned_to}</span>}
      </div>
      <div className="device-card-actions" onClick={(e) => e.stopPropagation()}>
        <button className="btn btn-secondary btn-sm" onClick={() => onEdit(device)}>تعديل</button>
        <button className="btn btn-primary btn-sm" onClick={() => onView(device)}>عرض</button>
      </div>
    </div>
  );
}
