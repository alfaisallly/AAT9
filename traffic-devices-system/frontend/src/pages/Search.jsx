import { useEffect, useState } from 'react';
import { api, labels, statusBadgeClass } from '../api';
import { useAuth } from '../context/AuthContext';

const SEARCH_TYPES = [
  { key: 'asset_number', label: 'الرقم الأميني', icon: '🔢' },
  { key: 'directorate', label: 'المديرية / الدائرة', icon: '🏛️' },
  { key: 'general', label: 'بحث عام', icon: '🔍' },
];

export default function Search() {
  const { activeDirectorateId } = useAuth();
  const [searchType, setSearchType] = useState('asset_number');
  const [query, setQuery] = useState('');
  const [directorateId, setDirectorateId] = useState('');
  const [results, setResults] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [directorates, setDirectorates] = useState([]);

  useEffect(() => {
    api.getDirectorates().then(setDirectorates);
    loadLogs();
  }, []);

  const loadLogs = () => api.getSearchLogs().then(setLogs);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await api.searchDevices({
        search_type: searchType,
        query: searchType === 'directorate' ? '' : query,
        directorate_id: searchType === 'directorate'
          ? Number(directorateId || activeDirectorateId)
          : undefined,
      });
      setResults(res);
      loadLogs();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportLog = () => api.exportSearchLogs();

  const handleClearLog = async () => {
    if (!confirm('هل تريد حفظ السجل ثم مسحه؟')) return;
    await api.exportSearchLogs();
    await api.clearSearchLogs(true);
    loadLogs();
    alert('تم تصدير السجل ومسحه');
  };

  return (
    <div className="search-page">
      <div className="page-header">
        <div>
          <h2>🔍 البحث عن الأجهزة</h2>
          <p className="page-subtitle">بحث بالرقم الأميني أو المديرية مع توثيق سجل البحث</p>
        </div>
      </div>

      <div className="search-type-cards">
        {SEARCH_TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`movement-type-card ${searchType === t.key ? 'active' : ''}`}
            onClick={() => setSearchType(t.key)}
          >
            <span className="mt-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="search-form">
          {searchType === 'directorate' ? (
            <div className="form-group">
              <label>اختر المديرية / الدائرة</label>
              <select value={directorateId || activeDirectorateId || ''} onChange={(e) => setDirectorateId(e.target.value)} required>
                <option value="">اختر المديرية</option>
                {directorates.map((d) => <option key={d.id} value={d.id}>{d.name_ar}</option>)}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label>{searchType === 'asset_number' ? 'الرقم الأميني' : 'كلمة البحث'}</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchType === 'asset_number' ? 'أدخل الرقم الأميني...' : 'رقم تسلسلي، مصنع، موقع...'}
                required
              />
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'جاري البحث...' : 'بحث'}
          </button>
        </form>
      </div>

      {results && (
        <div className="card">
          <h3>نتائج البحث: {results.total} جهاز</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>الرقم الأميني</th>
                  <th>التسلسلي</th>
                  <th>النوع</th>
                  <th>الموديل</th>
                  <th>المديرية</th>
                  <th>مكان العمل</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {results.devices.length === 0 ? (
                  <tr><td colSpan="7" className="empty-state">لا توجد نتائج</td></tr>
                ) : results.devices.map((d) => (
                  <tr key={d.id}>
                    <td><strong>{d.asset_number || '—'}</strong></td>
                    <td>{d.serial_number}</td>
                    <td>{labels.deviceTypes[d.device_type]}</td>
                    <td>{d.model?.brand?.name_ar} — {d.model?.name}</td>
                    <td>{d.directorate?.name_ar}</td>
                    <td>{d.workplace || '—'}</td>
                    <td><span className={`badge ${statusBadgeClass(d.status)}`}>{labels.deviceStatus[d.status] || d.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <div className="inventory-header">
          <h3>📋 سجل عمليات البحث</h3>
          <div className="btn-group">
            <button className="btn btn-export btn-sm" onClick={handleExportLog}>💾 حفظ السجل</button>
            <button className="btn btn-danger btn-sm" onClick={handleClearLog}>🗑️ مسح السجل</button>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>النوع</th><th>الاستعلام</th><th>النتائج</th><th>التاريخ</th></tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="4" className="empty-state">لا توجد عمليات بحث</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.search_type}</td>
                  <td>{log.query_value}</td>
                  <td>{log.results_count}</td>
                  <td>{new Date(log.created_at).toLocaleString('ar-IQ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
