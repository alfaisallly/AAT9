import { useEffect, useState } from 'react';
import { api, labels } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Reports() {
  const { activeDirectorateId, isCentral } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetcher = activeDirectorateId
      ? () => api.getReportDirectorate(activeDirectorateId)
      : isCentral
        ? () => api.getReportCentral()
        : () => api.getReportSummary();
    fetcher().then(setReport).finally(() => setLoading(false));
  }, [activeDirectorateId, isCentral]);

  if (loading) return <div>جاري تحميل التقرير...</div>;
  if (!report) return null;

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h2>📈 {report.title}</h2>
          <p className="page-subtitle">{report.scope} — {new Date(report.generated_at).toLocaleDateString('ar-IQ')}</p>
        </div>
        <button className="btn btn-print" onClick={() => api.exportDashboardPdf(activeDirectorateId)}>📄 PDF</button>
      </div>

      <div className="report-summary-cards">
        <div className="report-card total"><h4>الإجمالي</h4><div className="num">{report.total_devices}</div></div>
        <div className="report-card success"><h4>يصلح للعمل</h4><div className="num">{report.working}</div></div>
        <div className="report-card danger"><h4>مستهلك</h4><div className="num">{report.consumed}</div></div>
        <div className="report-card accent"><h4>نسبة الجاهزية</h4><div className="num">{report.readiness_percent}%</div></div>
      </div>

      <div className="dashboard-grid">
        <ReportTable title="حسب النوع" data={report.by_type} labelKey="name" />
        <ReportTable title="حسب الشركة (هايتيرا / تترا / ...)" data={report.by_brand} labelKey="name" />
        <ReportTable title="حسب مكان العمل" data={report.by_workplace} labelKey="name" />
        {isCentral && !activeDirectorateId && (
          <ReportTable title="حسب المديرية" data={report.by_directorate} labelKey="name" />
        )}
        <ReportTable title="حسب الحالة" data={report.by_status} labelKey="name" />
      </div>

      <div className="card report-insight">
        <h3>💡 تحليل الاحتياج</h3>
        <p>
          من أصل <strong>{report.total_devices}</strong> جهازاً،
          <strong> {report.working}</strong> يصلح للعمل ({report.readiness_percent}%) و
          <strong> {report.consumed}</strong> مستهلك.
          {report.readiness_percent < 70 && ' ⚠️ نسبة الجاهزية منخفضة — يُنصح بتعزيز المخزون الصالح.'}
          {report.readiness_percent >= 70 && ' ✅ وضع المخزون مقبول.'}
        </p>
      </div>
    </div>
  );
}

function ReportTable({ title, data, labelKey }) {
  const typeLabels = labels.deviceTypes;
  return (
    <div className="card">
      <h3>{title}</h3>
      <table><tbody>
        {data.map((row) => (
          <tr key={row[labelKey]}>
            <td>{typeLabels[row[labelKey]] || row[labelKey]}</td>
            <td><strong>{row.count}</strong></td>
          </tr>
        ))}
      </tbody></table>
    </div>
  );
}
