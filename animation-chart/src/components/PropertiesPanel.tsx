import type { DCNodeData, NodeStatus } from '../types';

interface PropertiesPanelProps {
  node: DCNodeData | null;
  onUpdate: (updates: Partial<DCNodeData>) => void;
  locale: 'ar' | 'en';
}

export function PropertiesPanel({ node, onUpdate, locale }: PropertiesPanelProps) {
  const isAr = locale === 'ar';

  if (!node) {
    return (
      <aside className="properties-panel properties-empty">
        <p>{isAr ? 'اختر مكوّناً لتعديل خصائصه' : 'Select a component to edit its properties'}</p>
      </aside>
    );
  }

  return (
    <aside className="properties-panel">
      <h3>{isAr ? 'الخصائص' : 'Properties'}</h3>
      <div className="prop-field">
        <label>{isAr ? 'الاسم' : 'Label'}</label>
        <input
          value={node.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
        />
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
        <label>{isAr ? 'الطراز' : 'Model'}</label>
        <input
          value={node.model ?? ''}
          onChange={(e) => onUpdate({ model: e.target.value })}
        />
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
            onChange={(e) =>
              onUpdate({ metrics: { ...node.metrics, cpu: Number(e.target.value) } })
            }
          />
        </div>
      )}
    </aside>
  );
}
