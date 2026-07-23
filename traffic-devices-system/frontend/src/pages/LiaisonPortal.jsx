import { useEffect, useState } from 'react';
import { api, labels } from '../api';
import { useAuth } from '../context/AuthContext';
import DeviceForm, { deviceToForm, emptyDeviceForm, formToPayload } from '../components/devices/DeviceForm';
import BookArchiveUpload, { getBookMeta } from '../components/devices/BookArchiveUpload';

export default function LiaisonPortal() {
  const { user, activeDirectorateId } = useAuth();
  const [auditLogs, setAuditLogs] = useState([]);
  const [devices, setDevices] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [directorates, setDirectorates] = useState([]);
  const [models, setModels] = useState([]);
  const [form, setForm] = useState(emptyDeviceForm);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [bookNumber, setBookNumber] = useState('');
  const [bookFile, setBookFile] = useState(null);
  const [tab, setTab] = useState('devices');

  const dirId = user?.directorate_id || activeDirectorateId;

  useEffect(() => {
    api.getProvinces().then(setProvinces);
    api.getModels().then(setModels);
    api.getDirectorates().then(setDirectorates);
    loadData();
  }, [dirId]);

  const loadData = () => {
    if (dirId) {
      api.getDevices({ directorate_id: dirId }).then(setDevices);
      api.getAuditLogs(dirId).then(setAuditLogs);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!bookNumber || !bookFile) {
      setError('يجب أرشفة الكتاب الرسمي (الرقم + الصورة) قبل الحفظ');
      return;
    }
    try {
      const payload = {
        ...formToPayload(form),
        ...getBookMeta(bookNumber, bookFile),
      };
      if (editing) {
        await api.updateDevice(editing.id, payload);
      } else {
        await api.createDevice(payload);
      }
      setForm({ ...emptyDeviceForm, directorate_id: dirId || '' });
      setEditing(null);
      setBookNumber('');
      setBookFile(null);
      loadData();
      alert('تم الحفظ وتوثيق العملية');
    } catch (err) {
      setError(err.message);
    }
  };

  const openEdit = (device) => {
    setEditing(device);
    setForm(deviceToForm(device));
    setBookNumber('');
    setBookFile(null);
    setTab('entry');
  };

  return (
    <div className="liaison-portal">
      <div className="page-header">
        <div>
          <h2>🏛️ واجهة مسؤول المديرية</h2>
          <p className="page-subtitle">{user?.directorate?.name_ar || 'مديريتك'} — إدارة وتحديث أجهزة المديرية</p>
        </div>
      </div>

      <div className="page-tabs">
        <button type="button" className={`page-tab ${tab === 'devices' ? 'active' : ''}`} onClick={() => setTab('devices')}>
          📋 أجهزة المديرية ({devices.length})
        </button>
        <button type="button" className={`page-tab ${tab === 'entry' ? 'active' : ''}`} onClick={() => { setTab('entry'); setEditing(null); }}>
          ➕ إدخال / تعديل
        </button>
        <button type="button" className={`page-tab ${tab === 'audit' ? 'active' : ''}`} onClick={() => setTab('audit')}>
          📜 سجل التعديلات
        </button>
      </div>

      {tab === 'devices' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>الرقم الأميني</th><th>التسلسلي</th><th>النوع</th><th>مكان العمل</th><th>الحالة</th><th></th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => (
                  <tr key={d.id}>
                    <td>{d.asset_number || '—'}</td>
                    <td>{d.serial_number}</td>
                    <td>{labels.deviceTypes[d.device_type]}</td>
                    <td>{d.workplace || '—'}</td>
                    <td>{labels.deviceStatus[d.status]}</td>
                    <td><button className="btn btn-secondary btn-sm" onClick={() => openEdit(d)}>تعديل</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'entry' && (
        <div className="card">
          <h3>{editing ? `تعديل: ${editing.serial_number}` : 'إدخال جهاز جديد'}</h3>
          {error && <div className="error-message">{error}</div>}
          <BookArchiveUpload
            bookNumber={bookNumber}
            setBookNumber={setBookNumber}
            bookFile={bookFile}
            setBookFile={setBookFile}
            required
          />
          <DeviceForm
            form={{ ...form, directorate_id: dirId || form.directorate_id }}
            setForm={setForm}
            onSubmit={handleSubmit}
            onCancel={() => { setEditing(null); setTab('devices'); }}
            editing={editing}
            error=""
            provinces={provinces}
            models={models}
            directorates={directorates.filter((d) => !dirId || d.id === dirId)}
          />
        </div>
      )}

      {tab === 'audit' && (
        <div className="card">
          <div className="inventory-header">
            <h3>📜 سجل التعديلات الموثّقة</h3>
            <button className="btn btn-export btn-sm" onClick={() => api.exportAuditLogs(dirId)}>💾 تصدير</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>الإجراء</th><th>الجهاز</th><th>التغييرات</th><th>المستخدم</th>
                  <th>رقم الكتاب</th><th>صورة الكتاب</th><th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.action}</td>
                    <td>{log.entity_label}</td>
                    <td>{log.changes_summary}</td>
                    <td>{log.user?.full_name}</td>
                    <td>{log.official_book_number || '—'}</td>
                    <td>
                      {log.book_image_path ? (
                        <a href={`/${log.book_image_path}`} target="_blank" rel="noreferrer">📎 {log.book_image_filename}</a>
                      ) : '—'}
                    </td>
                    <td>{new Date(log.created_at).toLocaleString('ar-IQ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
