import { useEffect, useState } from 'react';
import { api, labels } from '../api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';

const emptyForm = {
  book_number: '',
  book_type: 'receipt',
  book_date: new Date().toISOString().split('T')[0],
  province_id: '',
  subject: '',
  from_entity: '',
  to_entity: '',
  notes: '',
  device_items: [],
};

export default function Books() {
  const { isManager } = useAuth();
  const [books, setBooks] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [devices, setDevices] = useState([]);
  const [filters, setFilters] = useState({ province_id: '', book_type: '' });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');

  const loadData = () => api.getBooks(filters).then(setBooks);

  useEffect(() => {
    api.getProvinces().then(setProvinces);
    api.getDevices().then(setDevices);
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

  const openEdit = (book) => {
    setEditing(book);
    setForm({
      book_number: book.book_number,
      book_type: book.book_type,
      book_date: book.book_date,
      province_id: book.province_id,
      subject: book.subject,
      from_entity: book.from_entity,
      to_entity: book.to_entity,
      notes: book.notes || '',
      device_items: book.device_items.map((i) => ({
        device_id: i.device_id,
        quantity: i.quantity,
        notes: i.notes || '',
      })),
    });
    setError('');
    setShowModal(true);
  };

  const addDeviceItem = () => {
    if (!selectedDevice) return;
    if (form.device_items.some((i) => i.device_id === Number(selectedDevice))) return;
    setForm({
      ...form,
      device_items: [...form.device_items, { device_id: Number(selectedDevice), quantity: 1, notes: '' }],
    });
    setSelectedDevice('');
  };

  const removeDeviceItem = (deviceId) => {
    setForm({
      ...form,
      device_items: form.device_items.filter((i) => i.device_id !== deviceId),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        province_id: Number(form.province_id),
        notes: form.notes || null,
      };
      if (editing) {
        await api.updateBook(editing.id, payload);
      } else {
        await api.createBook(payload);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكتاب؟')) return;
    await api.deleteBook(id);
    loadData();
  };

  const getDeviceLabel = (deviceId) => {
    const d = devices.find((dev) => dev.id === deviceId);
    return d ? `${d.serial_number} - ${labels.deviceTypes[d.device_type]}` : deviceId;
  };

  const handleExportExcel = async () => {
    try {
      await api.exportBooksExcel(filters);
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePrintBook = async (bookId) => {
    try {
      await api.exportBookPdf(bookId);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <PageHeader title="أرشيف الكتب الرسمية" subtitle="توثيق كتب الاستلام والتسليم الرسمية">
        <div className="btn-group">
          <button type="button" className="btn btn-export" onClick={handleExportExcel}>Excel</button>
          <button type="button" className="btn btn-primary" onClick={openCreate}>إضافة كتاب</button>
        </div>
      </PageHeader>

      <div className="filters">
        <select value={filters.province_id} onChange={(e) => setFilters({ ...filters, province_id: e.target.value })}>
          <option value="">جميع المحافظات</option>
          {provinces.map((p) => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
        </select>
        <select value={filters.book_type} onChange={(e) => setFilters({ ...filters, book_type: e.target.value })}>
          <option value="">جميع الأنواع</option>
          {Object.entries(labels.bookTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>رقم الكتاب</th>
                <th>النوع</th>
                <th>التاريخ</th>
                <th>المحافظة</th>
                <th>الموضوع</th>
                <th>من</th>
                <th>إلى</th>
                <th>عدد الأجهزة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr><td colSpan="9" className="empty-state">لا توجد كتب</td></tr>
              ) : books.map((b) => (
                <tr key={b.id}>
                  <td>{b.book_number}</td>
                  <td><span className="badge badge-info">{labels.bookTypes[b.book_type]}</span></td>
                  <td>{b.book_date}</td>
                  <td>{b.province?.name_ar}</td>
                  <td>{b.subject}</td>
                  <td>{b.from_entity}</td>
                  <td>{b.to_entity}</td>
                  <td>{b.device_items?.length || 0}</td>
                  <td>
                    <button className="btn btn-print btn-sm" onClick={() => handlePrintBook(b.id)}>طباعة</button>
                    <button className="btn btn-secondary btn-sm" style={{ marginRight: '0.5rem' }} onClick={() => openEdit(b)}>تعديل</button>
                    {isManager && (
                      <button className="btn btn-danger btn-sm" style={{ marginRight: '0.5rem' }} onClick={() => handleDelete(b.id)}>حذف</button>
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
            <h3>{editing ? 'تعديل كتاب رسمي' : 'إضافة كتاب رسمي'}</h3>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>رقم الكتاب *</label>
                  <input value={form.book_number} onChange={(e) => setForm({ ...form, book_number: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>نوع الكتاب *</label>
                  <select value={form.book_type} onChange={(e) => setForm({ ...form, book_type: e.target.value })} required>
                    {Object.entries(labels.bookTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>تاريخ الكتاب *</label>
                  <input type="date" value={form.book_date} onChange={(e) => setForm({ ...form, book_date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>المحافظة *</label>
                  <select value={form.province_id} onChange={(e) => setForm({ ...form, province_id: e.target.value })} required>
                    <option value="">اختر المحافظة</option>
                    {provinces.map((p) => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>الموضوع *</label>
                  <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>من (الجهة المرسلة) *</label>
                  <input value={form.from_entity} onChange={(e) => setForm({ ...form, from_entity: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>إلى (الجهة المستلمة) *</label>
                  <input value={form.to_entity} onChange={(e) => setForm({ ...form, to_entity: e.target.value })} required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>ملاحظات</label>
                  <textarea rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.75rem', color: 'var(--primary)' }}>الأجهزة المرتبطة</h4>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)} style={{ flex: 1 }}>
                    <option value="">اختر جهازاً</option>
                    {devices.map((d) => (
                      <option key={d.id} value={d.id}>{d.serial_number} - {labels.deviceTypes[d.device_type]}</option>
                    ))}
                  </select>
                  <button type="button" className="btn btn-secondary" onClick={addDeviceItem}>إضافة</button>
                </div>
                {form.device_items.length > 0 && (
                  <table>
                    <thead>
                      <tr><th>الجهاز</th><th>الكمية</th><th></th></tr>
                    </thead>
                    <tbody>
                      {form.device_items.map((item) => (
                        <tr key={item.device_id}>
                          <td>{getDeviceLabel(item.device_id)}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              style={{ width: '70px' }}
                              onChange={(e) => setForm({
                                ...form,
                                device_items: form.device_items.map((i) =>
                                  i.device_id === item.device_id ? { ...i, quantity: Number(e.target.value) } : i
                                ),
                              })}
                            />
                          </td>
                          <td>
                            <button type="button" className="btn btn-danger btn-sm" onClick={() => removeDeviceItem(item.device_id)}>حذف</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
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
