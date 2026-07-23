import { labels, statusBadgeClass } from '../../api';

const STATUS_OPTIONS = [
  { key: 'working', icon: '✅', desc: 'يصلح للعمل' },
  { key: 'consumed', icon: '❌', desc: 'مستهلك — لا يصلح للعمل' },
];

const TYPE_OPTIONS = [
  { key: 'desktop', icon: '🖥️', label: 'جهاز مكتبي' },
  { key: 'mobile', icon: '📱', label: 'جهاز محمول' },
  { key: 'wheel', icon: '🚗', label: 'جهاز عجلة' },
];

export const DEVICE_FORM_SECTIONS = [
  { id: 'identity', title: 'بيانات التعريف', icon: '🔖' },
  { id: 'classification', title: 'التصنيف والمواصفات', icon: '📋' },
  { id: 'location', title: 'الموقع والتخصيص', icon: '📍' },
  { id: 'status', title: 'الحالة والوصف', icon: '⚙️' },
  { id: 'dates', title: 'التواريخ', icon: '📅' },
  { id: 'notes', title: 'ملاحظات إضافية', icon: '📝' },
  { id: 'documents', title: 'الأوليات الورقية', icon: '📄' },
];

export function StatusSelector({ value, onChange }) {
  return (
    <div className="status-selector">
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          className={`status-option ${value === opt.key ? 'active' : ''} ${statusBadgeClass(opt.key).replace('badge-', 'status-')}`}
          onClick={() => onChange(opt.key)}
        >
          <span className="status-option-icon">{opt.icon}</span>
          <span className="status-option-label">{labels.deviceStatus[opt.key]}</span>
          <span className="status-option-desc">{opt.desc}</span>
        </button>
      ))}
    </div>
  );
}

export function TypeSelector({ value, onChange }) {
  return (
    <div className="type-selector">
      {TYPE_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          className={`type-option ${value === opt.key ? 'active' : ''}`}
          onClick={() => onChange(opt.key)}
        >
          <span className="type-option-icon">{opt.icon}</span>
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

export function FieldDisplay({ label, value, icon, fullWidth }) {
  return (
    <div className={`field-display ${fullWidth ? 'full-width' : ''}`}>
      <div className="field-display-label">
        {icon && <span>{icon}</span>}
        {label}
      </div>
      <div className="field-display-value">{value || '—'}</div>
    </div>
  );
}

export function FormSection({ title, icon, children, active }) {
  if (!active) return null;
  return (
    <div className="form-section">
      <div className="form-section-header">
        <span>{icon}</span>
        <h4>{title}</h4>
      </div>
      <div className="form-section-body">{children}</div>
    </div>
  );
}

export function SectionTabs({ sections, active, onChange }) {
  return (
    <div className="section-tabs">
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          className={`section-tab ${active === s.id ? 'active' : ''}`}
          onClick={() => onChange(s.id)}
        >
          <span>{s.icon}</span>
          <span>{s.title}</span>
        </button>
      ))}
    </div>
  );
}

export { STATUS_OPTIONS, TYPE_OPTIONS };
