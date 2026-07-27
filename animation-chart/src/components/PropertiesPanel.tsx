import { Trash2 } from 'lucide-react';
import type { DCNodeData, NodeStatus } from '../types';

interface PropertiesPanelProps {
  node: DCNodeData | null;
  nodeId: string | null;
  locale: 'ar' | 'en';
  onUpdate: (updates: Partial<DCNodeData>) => void;
  onDelete: () => void;
}

export function PropertiesPanel({ node, nodeId, onUpdate, onDelete, locale }: PropertiesPanelProps) {
  const isAr = locale === 'ar';

  if (!node || !nodeId) {
    return (
      <aside className="properties-panel properties-empty">
        <p>{isAr ? 'اختر مكوّناً لتعديل خصائصه أو حذفه' : 'Select a component to edit or delete'}</p>
      </aside>
    );
  }

  return (
    <aside className="properties-panel">
      <div className="panel-title-row">
        <h3>{isAr ? 'الخصائص' : 'Properties'}</h3>
        <button type="button" className="icon-btn danger" onClick={onDelete} title={isAr ? 'حذف' : 'Delete'}>
          <Trash2 size={14} />
        </button>
      </div>
      <div className="prop-field">
        <label>{isAr ? 'الاسم' : 'Label'}</label>
        <input value={node.label} onChange={(e) => onUpdate({ label: e.target.value })} />
      </div>
      <div className="prop-field">
        <label>{isAr ? 'عنوان IP' : 'IP Address'}</label>
        <input
          value={node.ip ?? ''}
          onChange={(e) => onUpdate({ ip: e.target.value })}
          placeholder="10.0.0.1"
        />
      </div>
      <div className="prop-field">
        <label>{isAr ? 'مضيف حقيقي' : 'Real host'}</label>
        <input
          value={node.realHost ?? ''}
          onChange={(e) => onUpdate({ realHost: e.target.value })}
          placeholder="host.dc.local"
        />
      </div>
      <div className="prop-field">
        <label>{isAr ? 'رابط الفحص HTTP' : 'Health URL'}</label>
        <input
          value={node.healthUrl ?? ''}
          onChange={(e) => onUpdate({ healthUrl: e.target.value })}
          placeholder="http://10.0.0.1/health"
        />
      </div>
      <div className="prop-field">
        <label>{isAr ? 'الطراز' : 'Model'}</label>
        <input value={node.model ?? ''} onChange={(e) => onUpdate({ model: e.target.value })} />
      </div>
      <div className="prop-field">
        <label>{isAr ? 'الحالة' : 'Status'}</label>
        <select
          value={node.status}
          onChange={(e) => onUpdate({ status: e.target.value as NodeStatus })}
        >
          <option value="online">{isAr ? 'متصل' : 'Online'}</option>
          <option value="offline">{isAr ? 'غير متصل' : 'Offline'}</option>
          <option value="testing">{isAr ? 'اختبار' : 'Testing'}</option>
          <option value="degraded">{isAr ? 'متدهور' : 'Degraded'}</option>
        </select>
      </div>
      {node.metrics?.cpu !== undefined && (
        <div className="prop-field">
          <label>CPU %</label>
          <input
            type="number"
            min={0}
            max={100}
            value={node.metrics.cpu}
            onChange={(e) => onUpdate({ metrics: { ...node.metrics, cpu: Number(e.target.value) } })}
          />
        </div>
      )}
    </aside>
  );
}
