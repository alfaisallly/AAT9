import { useState } from 'react';
import { labels } from '../../api';
import {
  DEVICE_FORM_SECTIONS,
  FormSection,
  SectionTabs,
  StatusSelector,
  TypeSelector,
} from './DeviceFields';

export const emptyDeviceForm = {
  serial_number: '',
  manufacturer_serial: '',
  asset_number: '',
  model_id: '',
  province_id: '',
  directorate_id: '',
  status: 'working',
  device_type: 'mobile',
  workplace: '',
  location: '',
  department: '',
  assigned_to: '',
  condition_notes: '',
  notes: '',
  purchase_date: '',
  received_date: '',
  warranty_expiry: '',
  documents: [],
};

export default function DeviceForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  editing,
  error,
  provinces,
  models,
  directorates,
}) {
  const [activeSection, setActiveSection] = useState('identity');
  const filteredModels = models.filter((m) => !form.device_type || m.device_type === form.device_type);

  const update = (key, value) => setForm({ ...form, [key]: value });

  return (
    <form onSubmit={onSubmit} className="device-form">
      {error && <div className="error-message">{error}</div>}

      <SectionTabs
        sections={DEVICE_FORM_SECTIONS}
        active={activeSection}
        onChange={setActiveSection}
      />

      <FormSection title="بيانات التعريف" icon="🔖" active={activeSection === 'identity'}>
        <div className="form-grid">
          <div className="form-group">
            <label>الرقم التسلسلي *</label>
            <input
              value={form.serial_number}
              onChange={(e) => update('serial_number', e.target.value)}
              placeholder="مثال: HT-2024-001234"
              required
            />
            <span className="field-hint">رقم فريد لكل جهاز</span>
          </div>
          <div className="form-group">
            <label>الرقم المصنع *</label>
            <input
              value={form.manufacturer_serial}
              onChange={(e) => update('manufacturer_serial', e.target.value)}
              placeholder="الرقم من الشركة المصنعة"
            />
          </div>
          <div className="form-group">
            <label>رقم الأصل</label>
            <input
              value={form.asset_number}
              onChange={(e) => update('asset_number', e.target.value)}
              placeholder="رقم الأصل المحاسبي"
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="التصنيف والمواصفات" icon="📋" active={activeSection === 'classification'}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label>نوع الجهاز *</label>
          <TypeSelector
            value={form.device_type}
            onChange={(v) => { update('device_type', v); update('model_id', ''); }}
          />
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>الموديل *</label>
            <select value={form.model_id} onChange={(e) => update('model_id', e.target.value)} required>
              <option value="">اختر الموديل</option>
              {filteredModels.map((m) => (
                <option key={m.id} value={m.id}>{m.brand?.name_ar} — {m.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>المحافظة *</label>
            <select value={form.province_id} onChange={(e) => update('province_id', e.target.value)} required>
              <option value="">اختر المحافظة</option>
              {provinces.map((p) => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>المديرية *</label>
            <select value={form.directorate_id} onChange={(e) => update('directorate_id', e.target.value)} required>
              <option value="">اختر المديرية</option>
              {directorates.map((d) => <option key={d.id} value={d.id}>{d.name_ar}</option>)}
            </select>
          </div>
        </div>
      </FormSection>

      <FormSection title="الموقع والتخصيص" icon="📍" active={activeSection === 'location'}>
        <div className="form-grid">
          <div className="form-group">
            <label>مكان العمل *</label>
            <input
              value={form.workplace}
              onChange={(e) => update('workplace', e.target.value)}
              placeholder="مثال: شعبة اتصالات الكرخ"
              required
            />
          </div>
          <div className="form-group">
            <label>الموقع التفصيلي</label>
            <input
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="مثال: مقر مديرية المرور - الكرخ"
            />
          </div>
          <div className="form-group">
            <label>القسم / الوحدة</label>
            <input
              value={form.department}
              onChange={(e) => update('department', e.target.value)}
              placeholder="مثال: قسم الاتصالات"
            />
          </div>
          <div className="form-group">
            <label>المسؤول / المستخدم</label>
            <input
              value={form.assigned_to}
              onChange={(e) => update('assigned_to', e.target.value)}
              placeholder="اسم الشخص المسؤول عن الجهاز"
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="الحالة والوصف" icon="⚙️" active={activeSection === 'status'}>
        <div className="form-group">
          <label>حالة الجهاز *</label>
          <StatusSelector value={form.status} onChange={(v) => update('status', v)} />
        </div>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label>وصف الحالة / العطل</label>
          <textarea
            rows="3"
            value={form.condition_notes}
            onChange={(e) => update('condition_notes', e.target.value)}
            placeholder="وصف تفصيلي لحالة الجهاز أو نوع العطل إن وجد"
          />
        </div>
      </FormSection>

      <FormSection title="التواريخ" icon="📅" active={activeSection === 'dates'}>
        <div className="form-grid">
          <div className="form-group">
            <label>تاريخ الشراء</label>
            <input type="date" value={form.purchase_date} onChange={(e) => update('purchase_date', e.target.value)} />
          </div>
          <div className="form-group">
            <label>تاريخ الاستلام</label>
            <input type="date" value={form.received_date} onChange={(e) => update('received_date', e.target.value)} />
          </div>
          <div className="form-group">
            <label>انتهاء الضمان</label>
            <input type="date" value={form.warranty_expiry} onChange={(e) => update('warranty_expiry', e.target.value)} />
          </div>
        </div>
      </FormSection>

      <FormSection title="ملاحظات إضافية" icon="📝" active={activeSection === 'notes'}>
        <div className="form-group">
          <label>ملاحظات عامة</label>
          <textarea
            rows="4"
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="أي ملاحظات إضافية عن الجهاز..."
          />
        </div>
      </FormSection>

      <FormSection title="الأوليات الورقية" icon="📄" active={activeSection === 'documents'}>
        <p className="field-hint" style={{ marginBottom: '1rem' }}>
          من الاشتباك (التمليك) لغاية الإتلاف — سجل جميع الكتب والمستندات الرسمية
        </p>
        {!editing && (
          <p className="field-hint">يمكن إضافة الوثائق بعد حفظ الجهاز من لوحة التفاصيل</p>
        )}
        {editing && form.documents?.length > 0 && (
          <table><tbody>
            {form.documents.map((doc, i) => (
              <tr key={i}><td>{labels.documentTypes[doc.document_type]}</td><td>{doc.document_number}</td><td>{doc.document_date}</td></tr>
            ))}
          </tbody></table>
        )}
      </FormSection>

      <div className="form-actions device-form-actions">
        <button type="submit" className="btn btn-primary">
          {editing ? '💾 حفظ التعديلات' : '➕ إضافة الجهاز'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>إلغاء</button>
      </div>
    </form>
  );
}

export function deviceToForm(device) {
  return {
    serial_number: device.serial_number,
    manufacturer_serial: device.manufacturer_serial || '',
    asset_number: device.asset_number || '',
    model_id: device.model_id,
    province_id: device.province_id,
    directorate_id: device.directorate_id || '',
    status: device.status === 'consumed_non_disabled' || device.status === 'consumed_disabled' ? 'consumed' : device.status,
    device_type: device.device_type,
    workplace: device.workplace || '',
    location: device.location || '',
    department: device.department || '',
    assigned_to: device.assigned_to || '',
    condition_notes: device.condition_notes || '',
    notes: device.notes || '',
    purchase_date: device.purchase_date || '',
    received_date: device.received_date || '',
    warranty_expiry: device.warranty_expiry || '',
    documents: device.documents || [],
  };
}

export function formToPayload(form) {
  const { documents, ...rest } = form;
  return {
    ...rest,
    model_id: Number(form.model_id),
    province_id: Number(form.province_id),
    directorate_id: Number(form.directorate_id),
    manufacturer_serial: form.manufacturer_serial || null,
    asset_number: form.asset_number || null,
    workplace: form.workplace || null,
    location: form.location || null,
    department: form.department || null,
    assigned_to: form.assigned_to || null,
    condition_notes: form.condition_notes || null,
    notes: form.notes || null,
    purchase_date: form.purchase_date || null,
    received_date: form.received_date || null,
    warranty_expiry: form.warranty_expiry || null,
    documents: documents || [],
  };
}
