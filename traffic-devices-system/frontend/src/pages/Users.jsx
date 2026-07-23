import { useEffect, useState } from 'react';
import { api, labels } from '../api';

const emptyForm = {
  username: '',
  full_name: '',
  email: '',
  password: '',
  role: 'operator',
  province_id: '',
  is_active: true,
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const loadData = () => api.getUsers().then(setUsers);

  useEffect(() => {
    api.getProvinces().then(setProvinces);
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      username: user.username,
      full_name: user.full_name,
      email: user.email || '',
      password: '',
      role: user.role,
      province_id: user.province_id || '',
      is_active: user.is_active,
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
        province_id: form.province_id ? Number(form.province_id) : null,
        email: form.email || null,
      };
      if (editing) {
        const updatePayload = { ...payload };
        delete updatePayload.username;
        if (!updatePayload.password) delete updatePayload.password;
        await api.updateUser(editing.id, updatePayload);
      } else {
        await api.createUser(payload);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      await api.deleteUser(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>إدارة المستخدمين</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ إضافة مستخدم</button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>اسم المستخدم</th>
                <th>الاسم الكامل</th>
                <th>البريد</th>
                <th>الصلاحية</th>
                <th>المحافظة</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.full_name}</td>
                  <td>{u.email || '-'}</td>
                  <td><span className="badge badge-info">{labels.roles[u.role]}</span></td>
                  <td>{provinces.find((p) => p.id === u.province_id)?.name_ar || '-'}</td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {u.is_active ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>تعديل</button>
                    <button className="btn btn-danger btn-sm" style={{ marginRight: '0.5rem' }} onClick={() => handleDelete(u.id)}>حذف</button>
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
            <h3>{editing ? 'تعديل مستخدم' : 'إضافة مستخدم'}</h3>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {!editing && (
                  <div className="form-group">
                    <label>اسم المستخدم *</label>
                    <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
                  </div>
                )}
                <div className="form-group">
                  <label>الاسم الكامل *</label>
                  <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>البريد الإلكتروني</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{editing ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور *'}</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} minLength={6} />
                </div>
                <div className="form-group">
                  <label>الصلاحية *</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required>
                    {Object.entries(labels.roles).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>المحافظة</label>
                  <select value={form.province_id} onChange={(e) => setForm({ ...form, province_id: e.target.value })}>
                    <option value="">بدون</option>
                    {provinces.map((p) => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>الحالة</label>
                  <select value={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}>
                    <option value="true">نشط</option>
                    <option value="false">معطل</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">{editing ? 'حفظ' : 'إضافة'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
