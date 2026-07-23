import { useEffect, useState } from 'react';
import { api, labels } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [provinceId, setProvinceId] = useState('');

  useEffect(() => {
    api.getProvinces().then(setProvinces);
  }, []);

  useEffect(() => {
    api.getStats(provinceId || undefined).then(setStats);
  }, [provinceId]);

  if (!stats) return <div>جاري التحميل...</div>;

  const handleExportPdf = async () => {
    try {
      await api.exportDashboardPdf(provinceId || undefined);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>لوحة التحكم</h2>
        <div className="btn-group">
          <select value={provinceId} onChange={(e) => setProvinceId(e.target.value)}>
            <option value="">جميع المحافظات</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>{p.name_ar}</option>
            ))}
          </select>
          <button className="btn btn-print" onClick={handleExportPdf}>📄 تصدير PDF</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card accent">
          <h3>إجمالي الأجهزة</h3>
          <div className="value">{stats.total_devices}</div>
        </div>
        <div className="stat-card success">
          <h3>{labels.deviceStatus.working}</h3>
          <div className="value">{stats.working_devices}</div>
        </div>
        <div className="stat-card warning">
          <h3>{labels.deviceStatus.consumed_non_disabled}</h3>
          <div className="value">{stats.consumed_non_disabled}</div>
        </div>
        <div className="stat-card danger">
          <h3>{labels.deviceStatus.consumed_disabled}</h3>
          <div className="value">{stats.consumed_disabled}</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>إجمالي الكتب الرسمية</h3>
          <div className="value">{stats.total_books}</div>
        </div>
        <div className="stat-card">
          <h3>كتب {labels.bookTypes.receipt}</h3>
          <div className="value">{stats.receipt_books}</div>
        </div>
        <div className="stat-card">
          <h3>كتب {labels.bookTypes.delivery}</h3>
          <div className="value">{stats.delivery_books}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>الأجهزة حسب النوع</h3>
          <table>
            <tbody>
              {Object.entries(stats.devices_by_type).map(([type, count]) => (
                <tr key={type}>
                  <td>{labels.deviceTypes[type]}</td>
                  <td><strong>{count}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>الأجهزة حسب المحافظة</h3>
          <div className="table-wrapper">
            <table>
              <tbody>
                {stats.devices_by_province.map((item) => (
                  <tr key={item.province}>
                    <td>{item.province}</td>
                    <td><strong>{item.count}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
