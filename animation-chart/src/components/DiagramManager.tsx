import { FilePlus, Trash2, Copy, Pencil, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import type { SavedDiagram } from '../types';

interface DiagramManagerProps {
  diagrams: SavedDiagram[];
  activeId: string;
  locale: 'ar' | 'en';
  onSwitch: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string, nameAr: string) => void;
  onDuplicate: (id: string) => void;
}

export function DiagramManager({
  diagrams,
  activeId,
  locale,
  onSwitch,
  onCreate,
  onDelete,
  onRename,
  onDuplicate,
}: DiagramManagerProps) {
  const isAr = locale === 'ar';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startRename = (d: SavedDiagram) => {
    setEditingId(d.id);
    setEditName(isAr ? d.nameAr : d.name);
  };

  const commitRename = (d: SavedDiagram) => {
    if (editName.trim()) {
      onRename(d.id, isAr ? d.name : editName.trim(), isAr ? editName.trim() : d.nameAr);
    }
    setEditingId(null);
  };

  return (
    <section className="toolbar-section diagram-manager">
      <div className="section-head">
        <h3>
          <FolderOpen size={16} />
          {isAr ? 'المخططات' : 'Diagrams'}
        </h3>
        <button type="button" className="icon-btn" onClick={onCreate} title={isAr ? 'مخطط جديد' : 'New diagram'}>
          <FilePlus size={16} />
        </button>
      </div>

      <div className="diagram-list">
        {diagrams.map((d) => (
          <div key={d.id} className={`diagram-item ${d.id === activeId ? 'active' : ''}`}>
            {editingId === d.id ? (
              <input
                className="diagram-rename-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => commitRename(d)}
                onKeyDown={(e) => e.key === 'Enter' && commitRename(d)}
                autoFocus
              />
            ) : (
              <button type="button" className="diagram-name" onClick={() => onSwitch(d.id)}>
                <strong>{isAr ? d.nameAr : d.name}</strong>
                <small>{d.nodes.length} {isAr ? 'مكوّن' : 'nodes'} · {d.edges.length} {isAr ? 'رابط' : 'links'}</small>
              </button>
            )}
            <div className="diagram-actions">
              <button type="button" className="icon-btn" onClick={() => startRename(d)} title={isAr ? 'إعادة تسمية' : 'Rename'}>
                <Pencil size={14} />
              </button>
              <button type="button" className="icon-btn" onClick={() => onDuplicate(d.id)} title={isAr ? 'نسخ' : 'Duplicate'}>
                <Copy size={14} />
              </button>
              <button
                type="button"
                className="icon-btn danger"
                disabled={diagrams.length <= 1}
                onClick={() => {
                  if (window.confirm(isAr ? 'حذف هذا المخطط؟' : 'Delete this diagram?')) {
                    onDelete(d.id);
                  }
                }}
                title={isAr ? 'حذف' : 'Delete'}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
