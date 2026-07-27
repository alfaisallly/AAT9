import { useEffect, useState } from 'react';
import { api, labels, statusBadgeClass } from '../api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';

const SEARCH_TYPES = [
  { key: 'manufacturer_serial', label: 'الرقم المصنعي', desc: 'تسلسل التصنيع للجهاز' },
  { key: 'directorate', label: 'المديرية / الدائرة', desc: 'عرض أجهزة مديرية محددة' },
  { key: 'general', label: 'بحث عام', desc: 'تسلسلي داخلي، موقع، مكان عمل...' },
];

const searchTypeLabels = {
  manufacturer_serial: 'رقم مصنعي',
  asset_number: 'رقم أميني (قديم)',
  directorate: 'مديرية',
  general: 'عام',
};

export default function Search() {
  const { activeDirectorateId } = useAuth();
  const [searchType, setSearchType] = useState('manufacturer_serial');
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
    if (!confirm('سيتم تصدير السجل ثم مسحه. هل تريد المتابعة؟')) return;
    await api.exportSearchLogs();
    await api.clearSearchLogs(true);
    loadLogs();
  };

  return (
    <div className="search-page">
      <PageHeader
        title="البحث عن الأجهزة"
        subtitle="بحث بالرقم المصنعي (تسلسل التصنيع) أو المديرية مع توثيق سجل عمليات البحث"
      />

      <div className="search-type-cards">
        {SEARCH_TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`movement-type-card ${searchType === t.key ? 'active' : ''}`}
            onClick={() => setSearchType(t.key)}
          >
            <span className="status-option-label">{t.label}</span>
            <span className="status-option-desc">{t.desc}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="search-form">
          {searchType === 'directorate' ? (
            <div className="form-group">
              <label htmlFor="search-directorate">اختر المديرية / الدائرة</label>
              <select
                id="search-directorate"
                value={directorateId || activeDirectorateId || ''}
                onChange={(e) => setDirectorateId(e.target.value)}
                required
              >
                <option value="">اختر المديرية</option>
                {directorates.map((d) => <option key={d.id} value={d.id}>{d.name_ar}</option>)}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="search-query">
                {searchType === 'manufacturer_serial' ? 'الرقم المصنعي (تسلسل التصنيع)' : 'كلمة البحث'}
              </label>
              <input
                id="search-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchType === 'manufacturer_serial' ? 'أدخل الرقم المصنعي...' : 'رقم تسلسلي، موقع، مكان عمل...'}
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
          <div className="card-header">
            <h3>نتائج البحث ({results.total})</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>الرقم المصنعي</th>
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
                  <tr><td colSpan="7" className="empty-state">لا توجد نتائج مطابقة</td></tr>
                ) : results.devices.map((d) => (
                  <tr key={d.id}>
                    <td><strong>{d.manufacturer_serial || '—'}</strong></td>
                    <td>{d.serial_number}</td>
                    <td>{labels.deviceTypes[d.device_type]}</td>
                    <td>{d.model?.brand?.name_ar} — {d.model?.name}</td>
                    <td>{d.directorate?.name_ar}</td>
                    <td>{d.workplace || '—'}</td>
                    <td>
                      <span className={`badge ${statusBadgeClass(d.status)}`}>
                        {labels.deviceStatus[d.status] || d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>سجل عمليات البحث</h3>
          <div className="btn-group">
            <button type="button" className="btn btn-export btn-sm" onClick={handleExportLog}>حفظ السجل</button>
            <button type="button" className="btn btn-danger btn-sm" onClick={handleClearLog}>مسح السجل</button>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>النوع</th><th>الاستعلام</th><th>النتائج</th><th>التاريخ</th></tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="4" className="empty-state">لا توجد عمليات بحث مسجّلة</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id}>
                  <td><span className="badge badge-info">{searchTypeLabels[log.search_type] || log.search_type}</span></td>
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
