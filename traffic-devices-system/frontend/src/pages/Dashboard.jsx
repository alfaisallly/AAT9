import { useEffect, useState } from 'react';
import { api, labels } from '../api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Dashboard() {
  const { activeDirectorateId, isCentral } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getStats(activeDirectorateId || undefined).then(setStats);
  }, [activeDirectorateId]);

  if (!stats) return <LoadingSpinner label="جاري تحميل لوحة التحكم..." />;

  return (
    <div className="dashboard-page">
      <PageHeader
        title={isCentral && !activeDirectorateId ? 'الموقف الموحد المركزي' : 'لوحة التحكم'}
        subtitle={stats.scope}
        badge="نظرة عامة"
      >
        <button className="btn btn-print" onClick={() => api.exportDashboardPdf(activeDirectorateId)}>
          تصدير PDF
        </button>
      </PageHeader>

      <div className="readiness-banner">
        <div className="readiness-info">
          <span>نسبة الجاهزية</span>
          <strong>{stats.readiness_ratio}%</strong>
        </div>
        <div className="readiness-bar">
          <div className="readiness-fill" style={{ width: `${stats.readiness_ratio}%` }} />
        </div>
        <div className="readiness-detail">
          {stats.working_devices} يصلح للعمل · {stats.consumed_devices} مستهلك
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card accent"><h3>إجمالي الأجهزة</h3><div className="value">{stats.total_devices}</div></div>
        <div className="stat-card success"><h3>{labels.deviceStatus.working}</h3><div className="value">{stats.working_devices}</div></div>
        <div className="stat-card danger"><h3>{labels.deviceStatus.consumed}</h3><div className="value">{stats.consumed_devices}</div></div>
        <div className="stat-card"><h3>الكتب الرسمية</h3><div className="value">{stats.total_books}</div></div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header"><h3>حسب النوع</h3></div>
          <div className="table-wrapper">
            <table><tbody>
              {Object.entries(stats.devices_by_type).map(([t, c]) => (
                <tr key={t}><td>{labels.deviceTypes[t]}</td><td><strong>{c}</strong></td></tr>
              ))}
            </tbody></table>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>حسب الشركة المصنعة</h3></div>
          <div className="table-wrapper">
            <table><tbody>
              {stats.devices_by_brand.map((b) => (
                <tr key={b.brand}><td>{b.brand}</td><td><strong>{b.count}</strong></td></tr>
              ))}
            </tbody></table>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>حسب مكان العمل</h3></div>
          <div className="table-wrapper">
            <table><tbody>
              {stats.devices_by_workplace.map((w) => (
                <tr key={w.workplace}><td>{w.workplace}</td><td><strong>{w.count}</strong></td></tr>
              ))}
            </tbody></table>
          </div>
        </div>
        {isCentral && !activeDirectorateId && (
          <div className="card">
            <div className="card-header"><h3>حسب المديرية</h3></div>
            <div className="table-wrapper">
              <table><tbody>
                {stats.devices_by_directorate.map((d) => (
                  <tr key={d.directorate}><td>{d.directorate}</td><td><strong>{d.count}</strong></td></tr>
                ))}
              </tbody></table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
