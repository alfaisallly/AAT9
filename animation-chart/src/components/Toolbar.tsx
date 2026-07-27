import { componentPalette, templates } from '../data/templates';
import type { ComponentKind, DCNodeData } from '../types';
import {
  Server,
  Network,
  Router,
  Shield,
  Scale,
  Database,
  Zap,
  Wind,
  Layers,
  LayoutTemplate,
} from 'lucide-react';
import { DiagramManager } from './DiagramManager';
import type { SavedDiagram } from '../types';

const iconMap: Record<ComponentKind, React.ReactNode> = {
  rack: <Layers size={16} />,
  server: <Server size={16} />,
  switch: <Network size={16} />,
  router: <Router size={16} />,
  firewall: <Shield size={16} />,
  loadbalancer: <Scale size={16} />,
  storage: <Database size={16} />,
  pdu: <Zap size={16} />,
  cooling: <Wind size={16} />,
};

interface ToolbarProps {
  diagrams: SavedDiagram[];
  activeDiagramId: string;
  onAddComponent: (kind: ComponentKind, defaults: Partial<DCNodeData>) => void;
  onLoadTemplate: (templateId: string) => void;
  onSwitchDiagram: (id: string) => void;
  onCreateDiagram: () => void;
  onDeleteDiagram: (id: string) => void;
  onRenameDiagram: (id: string, name: string, nameAr: string) => void;
  onDuplicateDiagram: (id: string) => void;
  locale: 'ar' | 'en';
}

export function Toolbar({
  diagrams,
  activeDiagramId,
  onAddComponent,
  onLoadTemplate,
  onSwitchDiagram,
  onCreateDiagram,
  onDeleteDiagram,
  onRenameDiagram,
  onDuplicateDiagram,
  locale,
}: ToolbarProps) {
  const isAr = locale === 'ar';

  return (
    <aside className="toolbar">
      <DiagramManager
        diagrams={diagrams}
        activeId={activeDiagramId}
        locale={locale}
        onSwitch={onSwitchDiagram}
        onCreate={onCreateDiagram}
        onDelete={onDeleteDiagram}
        onRename={onRenameDiagram}
        onDuplicate={onDuplicateDiagram}
      />

      <section className="toolbar-section">
        <h3>
          <LayoutTemplate size={16} />
          {isAr ? 'القوالب' : 'Templates'}
        </h3>
        <div className="template-list">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              className="template-btn"
              onClick={() => onLoadTemplate(t.id)}
            >
              <strong>{isAr ? t.nameAr : t.name}</strong>
              <span>{isAr ? t.descriptionAr : t.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="toolbar-section">
        <h3>{isAr ? 'المكوّنات' : 'Components'}</h3>
        <div className="palette-grid">
          {componentPalette.map((item) => (
            <button
              key={item.kind}
              type="button"
              className="palette-item"
              onClick={() =>
                onAddComponent(item.kind, {
                  ...item.defaultData,
                  label: `${isAr ? item.labelAr : item.label} ${Date.now().toString().slice(-4)}`,
                  kind: item.kind,
                  status: 'online',
                })
              }
            >
              {iconMap[item.kind]}
              <span>{isAr ? item.labelAr : item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="toolbar-section toolbar-hint">
        <p>
          {isAr
            ? 'انقر لإضافة · اسحب للربط · Delete للحذف · المخططات تُحفظ تلقائياً'
            : 'Click to add · drag to connect · Delete to remove · diagrams auto-save'}
        </p>
      </section>
    </aside>
  );
}
