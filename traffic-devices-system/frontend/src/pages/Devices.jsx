import { useEffect, useState } from 'react';
import { api, labels, statusBadgeClass } from '../api';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  serial_number: '',
  asset_number: '',
  model_id: '',
  province_id: '',
  status: 'working',
  device_type: 'mobile',
  location: '',
  notes: '',
  purchase_date: '',
};

export default function Devices() {
  const { isManager } = useAuth();
  const [devices, setDevices] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [models, setModels] = useState([]);
  const [filters, setFilters] = useState({ search: '', province_id: '', status: '', device_type: '' });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const loadData = () => {
    api.getDevices(filters).then(setDevices);
  };

  useEffect(() => {
    api.getProvinces().then(setProvinces);
    api.getModels().then(setModels);
  }, []);

  useEffect(() => {
    loadData();
  }, [filters]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (device) => {
    setEditing(device);
    setForm({
      serial_number: device.serial_number,
      asset_number: device.asset_number || '',
      model_id: device.model_id,
      province_id: device.province_id,
      status: device.status,
      device_type: device.device_type,
      location: device.location || '',
      notes: device.notes || '',
      purchase_date: device.purchase_date || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        model_id: Number(form.model_id),
        province_id: Number(form.province_id),
        purchase_date: form.purchase_date || null,
        asset_number: form.asset_number || null,
        location: form.location || null,
        notes: form.notes || null,
      };
      if (editing) {
        await api.updateDevice(editing.id, payload);
      } else {
        await api.createDevice(payload);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الجهاز؟')) return;
    await api.deleteDevice(id);
    loadData();
  };

  const filteredModels = models.filter((m) => !form.device_type || m.device_type === form.device_type);

  const exportParams = {
    province_id: filters.province_id,
    status: filters.status,
    device_type: filters.device_type,
  };

  const handleExportExcel = async () => {
    try {
      await api.exportDevicesExcel(exportParams);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportPdf = async () => {
    try {
      await api.exportDevicesPdf(exportParams);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>إدارة الأجهزة</h2>
        <div className="btn-group">
          <button className="btn btn-export" onClick={handleExportExcel}>📊 Excel</button>
          <button className="btn btn-print" onClick={handleExportPdf}>📄 PDF</button>
          <button className="btn btn-primary" onClick={openCreate}>+ إضافة جهاز</button>
        </div>
      </div>

      <div className="filters">
        <input
          placeholder="بحث (رقم تسلسلي، رقم أصل، موقع)"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select value={filters.province_id} onChange={(e) => setFilters({ ...filters, province_id: e.target.value })}>
          <option value="">جميع المحافظات</option>
          {provinces.map((p) => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">جميع الحالات</option>
          {Object.entries(labels.deviceStatus).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filters.device_type} onChange={(e) => setFilters({ ...filters, device_type: e.target.value })}>
          <option value="">جميع الأنواع</option>
          {Object.entries(labels.deviceTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>الرقم التسلسلي</th>
                <th>رقم الأصل</th>
                <th>النوع</th>
                <th>الموديل</th>
                <th>المحافظة</th>
                <th>الحالة</th>
                <th>الموقع</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {devices.length === 0 ? (
                <tr><td colSpan="8" className="empty-state">لا توجد أجهزة</td></tr>
              ) : devices.map((d) => (
                <tr key={d.id}>
                  <td>{d.serial_number}</td>
                  <td>{d.asset_number || '-'}</td>
                  <td>{labels.deviceTypes[d.device_type]}</td>
                  <td>{d.model?.brand?.name_ar} - {d.model?.name}</td>
                  <td>{d.province?.name_ar}</td>
                  <td><span className={`badge ${statusBadgeClass(d.status)}`}>{labels.deviceStatus[d.status]}</span></td>
                  <td>{d.location || '-'}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(d)}>تعديل</button>
                    {isManager && (
                      <button className="btn btn-danger btn-sm" style={{ marginRight: '0.5rem' }} onClick={() => handleDelete(d.id)}>حذف</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? 'تعديل جهاز' : 'إضافة جهاز جديد'}</h3>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>الرقم التسلسلي *</label>
                  <input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>رقم الأصل</label>
                  <input value={form.asset_number} onChange={(e) => setForm({ ...form, asset_number: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>نوع الجهاز *</label>
                  <select value={form.device_type} onChange={(e) => setForm({ ...form, device_type: e.target.value, model_id: '' })} required>
                    {Object.entries(labels.deviceTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>الموديل *</label>
                  <select value={form.model_id} onChange={(e) => setForm({ ...form, model_id: e.target.value })} required>
                    <option value="">اختر الموديل</option>
                    {filteredModels.map((m) => (
                      <option key={m.id} value={m.id}>{m.brand?.name_ar} - {m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>المحافظة *</label>
                  <select value={form.province_id} onChange={(e) => setForm({ ...form, province_id: e.target.value })} required>
                    <option value="">اختر المحافظة</option>
                    {provinces.map((p) => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>حالة الجهاز *</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} required>
                    {Object.entries(labels.deviceStatus).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>الموقع</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>تاريخ الشراء</label>
                  <input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>ملاحظات</label>
                  <textarea rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">{editing ? 'حفظ التعديلات' : 'إضافة'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
