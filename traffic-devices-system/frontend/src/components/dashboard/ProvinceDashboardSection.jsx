import { useState } from 'react';
import { labels, statusBadgeClass } from '../../api';

export default function ProvinceDashboardSection({ province, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`province-panel ${open ? 'open' : ''}`}>
      <button type="button" className="province-panel-header" onClick={() => setOpen((v) => !v)}>
        <div className="province-panel-title">
          <span className="province-name">{province.province_name}</span>
          <span className="province-code">{province.province_code}</span>
        </div>
        <div className="province-panel-summary">
          <span className="province-stat">
            <strong>{province.total}</strong>
            <small>إجمالي</small>
          </span>
          <span className="province-stat success">
            <strong>{province.working}</strong>
            <small>صالح</small>
          </span>
          <span className="province-stat danger">
            <strong>{province.consumed}</strong>
            <small>مستهلك</small>
          </span>
          <span className="province-stat accent">
            <strong>{province.readiness_ratio}%</strong>
            <small>جاهزية</small>
          </span>
          <span className="province-toggle">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="province-panel-body">
          <div className="province-type-grid">
            {Object.entries(province.by_type).map(([typeKey, breakdown]) => (
              <div key={typeKey} className="province-type-card">
                <h4>{labels.deviceTypes[typeKey]}</h4>
                <div className="province-type-stats">
                  <div><span>الإجمالي</span><strong>{breakdown.total}</strong></div>
                  <div className="text-success"><span>صالح</span><strong>{breakdown.working}</strong></div>
                  <div className="text-danger"><span>مستهلك</span><strong>{breakdown.consumed}</strong></div>
                </div>
              </div>
            ))}
          </div>

          <div className="table-wrapper province-devices-table">
            <table>
              <thead>
                <tr>
                  <th>الرقم المصنعي</th>
                  <th>التسلسلي</th>
                  <th>النوع</th>
                  <th>الشركة / الموديل</th>
                  <th>المديرية</th>
                  <th>مكان العمل</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {province.devices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">لا توجد أجهزة مسجّلة في هذه المحافظة</td>
                  </tr>
                ) : province.devices.map((d) => (
                  <tr key={d.id}>
                    <td><strong>{d.manufacturer_serial || '—'}</strong></td>
                    <td>{d.serial_number}</td>
                    <td>{labels.deviceTypes[d.device_type]}</td>
                    <td>{d.brand_name} — {d.model_name}</td>
                    <td>{d.directorate_name || '—'}</td>
                    <td>{d.workplace || '—'}</td>
                    <td>
                      <span className={`badge ${statusBadgeClass(d.status)}`}>
                        {labels.deviceStatus[d.status]}
                      </span>
                    </td>
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
