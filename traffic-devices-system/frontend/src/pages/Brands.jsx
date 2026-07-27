import { useEffect, useState } from 'react';
import { api, labels } from '../api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';

export default function Brands() {
  const { isManager } = useAuth();
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [brandForm, setBrandForm] = useState({ name: '', name_ar: '' });
  const [modelForm, setModelForm] = useState({ brand_id: '', name: '', device_type: 'mobile' });
  const [error, setError] = useState('');

  const loadData = () => {
    api.getBrands().then(setBrands);
    api.getModels().then(setModels);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createBrand(brandForm);
      setShowBrandModal(false);
      setBrandForm({ name: '', name_ar: '' });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleModelSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createModel({
        ...modelForm,
        brand_id: Number(modelForm.brand_id),
      });
      setShowModelModal(false);
      setModelForm({ brand_id: '', name: '', device_type: 'mobile' });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <PageHeader title="الشركات والموديلات" subtitle="إدارة الشركات المصنعة وموديلات الأجهزة">
        {isManager && (
          <div className="btn-group">
            <button type="button" className="btn btn-secondary" onClick={() => { setError(''); setShowBrandModal(true); }}>شركة جديدة</button>
            <button type="button" className="btn btn-primary" onClick={() => { setError(''); setShowModelModal(true); }}>موديل جديد</button>
          </div>
        )}
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>الشركات المصنعة</h3>
          <table>
            <thead>
              <tr><th>الاسم بالعربية</th><th>الاسم بالإنجليزية</th></tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b.id}>
                  <td>{b.name_ar}</td>
                  <td>{b.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>الموديلات</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>الشركة</th>
                  <th>الموديل</th>
                  <th>نوع الجهاز</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.id}>
                    <td>{m.brand?.name_ar}</td>
                    <td>{m.name}</td>
                    <td>{labels.deviceTypes[m.device_type]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showBrandModal && (
        <div className="modal-overlay" onClick={() => setShowBrandModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>إضافة شركة جديدة</h3>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleBrandSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>الاسم بالإنجليزية *</label>
                  <input value={brandForm.name} onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>الاسم بالعربية *</label>
                  <input value={brandForm.name_ar} onChange={(e) => setBrandForm({ ...brandForm, name_ar: e.target.value })} required />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">إضافة</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBrandModal(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModelModal && (
        <div className="modal-overlay" onClick={() => setShowModelModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>إضافة موديل جديد</h3>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleModelSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>الشركة *</label>
                  <select value={modelForm.brand_id} onChange={(e) => setModelForm({ ...modelForm, brand_id: e.target.value })} required>
                    <option value="">اختر الشركة</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name_ar}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>اسم الموديل *</label>
                  <input value={modelForm.name} onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>نوع الجهاز *</label>
                  <select value={modelForm.device_type} onChange={(e) => setModelForm({ ...modelForm, device_type: e.target.value })} required>
                    {Object.entries(labels.deviceTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">إضافة</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModelModal(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
