import { useEffect, useState } from 'react';
import { api, labels } from '../api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProvinceDashboardSection from '../components/dashboard/ProvinceDashboardSection';

export default function Dashboard() {
  const { activeDirectorateId, isCentral } = useAuth();
  const [stats, setStats] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const dirId = activeDirectorateId || undefined;
    Promise.all([
      api.getStats(dirId),
      api.getProvincesOverview(dirId),
    ])
      .then(([s, o]) => {
        setStats(s);
        setOverview(o);
      })
      .finally(() => setLoading(false));
  }, [activeDirectorateId]);

  if (loading || !stats || !overview) {
    return <LoadingSpinner label="جاري تحميل لوحة التحكم..." />;
  }

  const provincesWithDevices = overview.provinces.filter((p) => p.total > 0);
  const emptyProvinces = overview.provinces.filter((p) => p.total === 0);

  return (
    <div className="dashboard-page">
      <PageHeader
        title={isCentral && !activeDirectorateId ? 'الموقف الموحد — جميع المحافظات' : 'لوحة التحكم'}
        subtitle={overview.scope}
        badge="موقف الأجهزة"
      >
        <button type="button" className="btn btn-print" onClick={() => api.exportDashboardPdf(activeDirectorateId)}>
          تصدير PDF
        </button>
      </PageHeader>

      <div className="readiness-banner">
        <div className="readiness-info">
          <span>نسبة الجاهزية الوطنية</span>
          <strong>{overview.national_readiness}%</strong>
        </div>
        <div className="readiness-bar">
          <div className="readiness-fill" style={{ width: `${overview.national_readiness}%` }} />
        </div>
        <div className="readiness-detail">
          {overview.national_working} يصلح للعمل · {overview.national_consumed} مستهلك · {overview.national_total} إجمالي
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card accent"><h3>إجمالي الأجهزة</h3><div className="value">{stats.total_devices}</div></div>
        <div className="stat-card success"><h3>{labels.deviceStatus.working}</h3><div className="value">{stats.working_devices}</div></div>
        <div className="stat-card danger"><h3>{labels.deviceStatus.consumed}</h3><div className="value">{stats.consumed_devices}</div></div>
        <div className="stat-card"><h3>المحافظات</h3><div className="value">{provincesWithDevices.length}</div></div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>ملخص سريع — حسب النوع (وطني)</h3>
        </div>
        <div className="table-wrapper">
          <table className="summary-type-table">
            <thead>
              <tr>
                <th>النوع</th>
                <th>الإجمالي</th>
                <th>يصلح للعمل</th>
                <th>مستهلك</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.devices_by_type).map(([typeKey, count]) => {
                const working = overview.provinces.reduce((sum, p) => sum + (p.by_type[typeKey]?.working || 0), 0);
                const consumed = overview.provinces.reduce((sum, p) => sum + (p.by_type[typeKey]?.consumed || 0), 0);
                return (
                  <tr key={typeKey}>
                    <td>{labels.deviceTypes[typeKey]}</td>
                    <td><strong>{count}</strong></td>
                    <td className="text-success"><strong>{working}</strong></td>
                    <td className="text-danger"><strong>{consumed}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="provinces-overview-header">
        <h2>موقف الأجهزة حسب المحافظة</h2>
        <p>واجهة موحّدة تعرض تفاصيل كل محافظة — الصالح والمستهلك وحسب النوع وجدول الأجهزة</p>
      </div>

      {provincesWithDevices.length === 0 ? (
        <div className="card empty-state">لا توجد أجهزة مسجّلة في النطاق الحالي</div>
      ) : (
        provincesWithDevices.map((province, index) => (
          <ProvinceDashboardSection
            key={province.province_id}
            province={province}
            defaultOpen={index === 0}
          />
        ))
      )}

      {isCentral && !activeDirectorateId && emptyProvinces.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>محافظات بدون أجهزة مسجّلة ({emptyProvinces.length})</h3></div>
          <div className="empty-provinces-list">
            {emptyProvinces.map((p) => (
              <span key={p.province_id} className="empty-province-chip">{p.province_name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
