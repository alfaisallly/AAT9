import { useEffect, useMemo, useState } from 'react';
import { api, labels, statusBadgeClass } from '../api';
import { useAuth } from '../context/AuthContext';
import DeviceForm, { deviceToForm, emptyDeviceForm, formToPayload } from '../components/devices/DeviceForm';
import DeviceDetailPanel, { DeviceCard } from '../components/devices/DeviceDetailPanel';
import InventoryPanel from '../components/devices/InventoryPanel';

const PAGE_TABS = [
  { id: 'list', label: 'قائمة الأجهزة', icon: '📋' },
  { id: 'add', label: 'إدخال جهاز', icon: '➕' },
  { id: 'inventory', label: 'مخزن الحركات', icon: '📦' },
];

export default function Devices() {
  const { isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [viewMode, setViewMode] = useState('table');
  const [devices, setDevices] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [models, setModels] = useState([]);
  const [filters, setFilters] = useState({ search: '', province_id: '', status: '', device_type: '' });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyDeviceForm);
  const [error, setError] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);

  const loadData = () => api.getDevices(filters).then(setDevices);

  useEffect(() => {
    api.getProvinces().then(setProvinces);
    api.getModels().then(setModels);
  }, []);

  useEffect(() => {
    loadData();
  }, [filters]);

  const stats = useMemo(() => ({
    total: devices.length,
    working: devices.filter((d) => d.status === 'working').length,
    consumed_ok: devices.filter((d) => d.status === 'consumed_non_disabled').length,
    consumed_bad: devices.filter((d) => d.status === 'consumed_disabled').length,
  }), [devices]);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyDeviceForm);
    setError('');
  };

  const openCreate = () => {
    resetForm();
    setActiveTab('add');
  };

  const openEdit = (device) => {
    setEditing(device);
    setForm(deviceToForm(device));
    setError('');
    setSelectedDevice(null);
    setActiveTab('add');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = formToPayload(form);
      if (editing) {
        await api.updateDevice(editing.id, payload);
      } else {
        await api.createDevice(payload);
      }
      resetForm();
      setActiveTab('list');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الجهاز؟')) return;
    await api.deleteDevice(id);
    setSelectedDevice(null);
    loadData();
  };

  const exportParams = {
    province_id: filters.province_id,
    status: filters.status,
    device_type: filters.device_type,
  };

  return (
    <div className="devices-page">
      <div className="page-header">
        <div>
          <h2>إدارة مخزن الأجهزة</h2>
          <p className="page-subtitle">إدارة شاملة للأجهزة — إدخال، عرض، وتتبع الحركات</p>
        </div>
        {activeTab === 'list' && (
          <div className="btn-group">
            <button className="btn btn-export" onClick={() => api.exportDevicesExcel(exportParams)}>📊 Excel</button>
            <button className="btn btn-print" onClick={() => api.exportDevicesPdf(exportParams)}>📄 PDF</button>
            <button className="btn btn-primary" onClick={openCreate}>+ إدخال جهاز</button>
          </div>
        )}
      </div>

      <div className="page-tabs">
        {PAGE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`page-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.id); if (tab.id === 'add' && !editing) resetForm(); }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'list' && (
        <>
          <div className="stats-grid device-stats">
            <div className="stat-card accent"><h3>إجمالي الأجهزة</h3><div className="value">{stats.total}</div></div>
            <div className="stat-card success"><h3>يعمل</h3><div className="value">{stats.working}</div></div>
            <div className="stat-card warning"><h3>مستهلك غير معطل</h3><div className="value">{stats.consumed_ok}</div></div>
            <div className="stat-card danger"><h3>مستهلك معطل</h3><div className="value">{stats.consumed_bad}</div></div>
          </div>

          <div className="list-toolbar">
            <div className="filters">
              <input
                placeholder="🔍 بحث (تسلسلي، أصل، موقع، قسم، مسؤول)"
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
            <div className="view-toggle">
              <button type="button" className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}>جدول</button>
              <button type="button" className={viewMode === 'cards' ? 'active' : ''} onClick={() => setViewMode('cards')}>بطاقات</button>
            </div>
          </div>

          {viewMode === 'cards' ? (
            <div className="device-cards-grid">
              {devices.length === 0 ? (
                <div className="empty-state card">لا توجد أجهزة — ابدأ بإدخال جهاز جديد</div>
              ) : devices.map((d) => (
                <DeviceCard key={d.id} device={d} onView={setSelectedDevice} onEdit={openEdit} />
              ))}
            </div>
          ) : (
            <div className="card">
              <div className="table-wrapper">
                <table className="devices-table">
                  <thead>
                    <tr>
                      <th>التسلسلي</th>
                      <th>النوع</th>
                      <th>الموديل</th>
                      <th>المحافظة</th>
                      <th>القسم</th>
                      <th>المسؤول</th>
                      <th>الحالة</th>
                      <th>الموقع</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.length === 0 ? (
                      <tr><td colSpan="9" className="empty-state">لا توجد أجهزة</td></tr>
                    ) : devices.map((d) => (
                      <tr key={d.id} className="device-row" onClick={() => setSelectedDevice(d)}>
                        <td><strong>{d.serial_number}</strong></td>
                        <td>{labels.deviceTypes[d.device_type]}</td>
                        <td>{d.model?.brand?.name_ar} — {d.model?.name}</td>
                        <td>{d.province?.name_ar}</td>
                        <td>{d.department || '—'}</td>
                        <td>{d.assigned_to || '—'}</td>
                        <td><span className={`badge ${statusBadgeClass(d.status)}`}>{labels.deviceStatus[d.status]}</span></td>
                        <td>{d.location || '—'}</td>
                        <td onClick={(e) => e.stopPropagation()}>
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
          )}
        </>
      )}

      {activeTab === 'add' && (
        <div className="card device-form-card">
          <div className="device-form-header">
            <h3>{editing ? '✏️ تعديل بيانات الجهاز' : '➕ إدخال جهاز جديد للمخزن'}</h3>
            {editing && <span className="badge badge-info">تعديل: {editing.serial_number}</span>}
          </div>
          <DeviceForm
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            onCancel={() => { resetForm(); setActiveTab('list'); }}
            editing={editing}
            error={error}
            provinces={provinces}
            models={models}
          />
        </div>
      )}

      {activeTab === 'inventory' && (
        <InventoryPanel devices={devices} provinces={provinces} onRefresh={loadData} />
      )}

      {selectedDevice && (
        <DeviceDetailPanel
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
          onEdit={openEdit}
          onDelete={handleDelete}
          isManager={isManager}
        />
      )}
    </div>
  );
}
