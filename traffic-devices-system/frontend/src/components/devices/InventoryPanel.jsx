import { useEffect, useState } from 'react';
import { api, labels } from '../../api';

const MOVEMENT_TYPES = [
  { key: 'in', label: 'إدخال', icon: '📥', color: 'success' },
  { key: 'out', label: 'إخراج', icon: '📤', color: 'danger' },
  { key: 'transfer', label: 'نقل', icon: '🔄', color: 'info' },
  { key: 'status_change', label: 'تغيير حالة', icon: '⚙️', color: 'warning' },
];

const emptyMovement = {
  device_id: '',
  movement_type: 'in',
  movement_date: new Date().toISOString().split('T')[0],
  province_id: '',
  from_entity: '',
  to_entity: '',
  reference_number: '',
  new_status: '',
  notes: '',
  update_device_status: false,
};

export default function InventoryPanel({ devices, provinces, onRefresh }) {
  const [movements, setMovements] = useState([]);
  const [filters, setFilters] = useState({ province_id: '', movement_type: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyMovement);
  const [error, setError] = useState('');

  const loadMovements = () => {
    api.getInventory(filters).then(setMovements);
  };

  useEffect(() => {
    loadMovements();
  }, [filters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        device_id: Number(form.device_id),
        province_id: Number(form.province_id),
        from_entity: form.from_entity || null,
        to_entity: form.to_entity || null,
        reference_number: form.reference_number || null,
        new_status: form.new_status || null,
        notes: form.notes || null,
        update_device_status: form.update_device_status && !!form.new_status,
      };
      await api.createInventoryMovement(payload);
      setShowForm(false);
      setForm(emptyMovement);
      loadMovements();
      onRefresh?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const getMovementLabel = (type) => MOVEMENT_TYPES.find((m) => m.key === type)?.label || type;
  const getMovementIcon = (type) => MOVEMENT_TYPES.find((m) => m.key === type)?.icon || '📦';

  return (
    <div className="inventory-panel">
      <div className="inventory-header">
        <div>
          <h3>📦 مخزن حركات الأجهزة</h3>
          <p className="inventory-subtitle">إدارة إدخال وإخراج ونقل الأجهزة</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setError(''); setShowForm(true); }}>
          + تسجيل حركة
        </button>
      </div>

      <div className="movement-type-cards">
        {MOVEMENT_TYPES.map((mt) => (
          <button
            key={mt.key}
            type="button"
            className={`movement-type-card ${filters.movement_type === mt.key ? 'active' : ''}`}
            onClick={() => setFilters({
              ...filters,
              movement_type: filters.movement_type === mt.key ? '' : mt.key,
            })}
          >
            <span className="mt-icon">{mt.icon}</span>
            <span>{mt.label}</span>
          </button>
        ))}
      </div>

      <div className="filters">
        <select value={filters.province_id} onChange={(e) => setFilters({ ...filters, province_id: e.target.value })}>
          <option value="">جميع المحافظات</option>
          {provinces.map((p) => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="card inventory-form-card">
          <h4>تسجيل حركة جديدة</h4>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>نوع الحركة *</label>
                <select value={form.movement_type} onChange={(e) => setForm({ ...form, movement_type: e.target.value })} required>
                  {MOVEMENT_TYPES.map((mt) => (
                    <option key={mt.key} value={mt.key}>{mt.icon} {mt.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>الجهاز *</label>
                <select value={form.device_id} onChange={(e) => setForm({ ...form, device_id: e.target.value })} required>
                  <option value="">اختر الجهاز</option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>{d.serial_number} — {labels.deviceTypes[d.device_type]}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>تاريخ الحركة *</label>
                <input type="date" value={form.movement_date} onChange={(e) => setForm({ ...form, movement_date: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>المحافظة *</label>
                <select value={form.province_id} onChange={(e) => setForm({ ...form, province_id: e.target.value })} required>
                  <option value="">اختر المحافظة</option>
                  {provinces.map((p) => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>من (الجهة المرسلة)</label>
                <input value={form.from_entity} onChange={(e) => setForm({ ...form, from_entity: e.target.value })} placeholder="الجهة التي أرسلت الجهاز" />
              </div>
              <div className="form-group">
                <label>إلى (الجهة المستلمة)</label>
                <input value={form.to_entity} onChange={(e) => setForm({ ...form, to_entity: e.target.value })} placeholder="الجهة التي استلمت الجهاز" />
              </div>
              <div className="form-group">
                <label>رقم المرجع / الكتاب</label>
                <input value={form.reference_number} onChange={(e) => setForm({ ...form, reference_number: e.target.value })} placeholder="رقم الكتاب الرسمي" />
              </div>
              {form.movement_type === 'status_change' && (
                <>
                  <div className="form-group">
                    <label>الحالة الجديدة</label>
                    <select value={form.new_status} onChange={(e) => setForm({ ...form, new_status: e.target.value })}>
                      <option value="">بدون تغيير</option>
                      {Object.entries(labels.deviceStatus).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={form.update_device_status}
                        onChange={(e) => setForm({ ...form, update_device_status: e.target.checked })}
                      />
                      {' '}تحديث حالة الجهاز تلقائياً
                    </label>
                  </div>
                </>
              )}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>ملاحظات</label>
                <textarea rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">تسجيل الحركة</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>النوع</th>
                <th>التاريخ</th>
                <th>الجهاز</th>
                <th>المحافظة</th>
                <th>من</th>
                <th>إلى</th>
                <th>المرجع</th>
                <th>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr><td colSpan="8" className="empty-state">لا توجد حركات مسجلة</td></tr>
              ) : movements.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span className={`movement-badge movement-${m.movement_type}`}>
                      {getMovementIcon(m.movement_type)} {getMovementLabel(m.movement_type)}
                    </span>
                  </td>
                  <td>{m.movement_date}</td>
                  <td>{m.device?.serial_number}</td>
                  <td>{m.province?.name_ar}</td>
                  <td>{m.from_entity || '—'}</td>
                  <td>{m.to_entity || '—'}</td>
                  <td>{m.reference_number || '—'}</td>
                  <td>{m.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
