import { useCallback, useEffect, useRef, useState } from 'react';
import type { Edge, Node } from '@xyflow/react';
import { enterpriseDataCenter } from '../data/templates';
import type { DCEdgeData, DCNodeData, SavedDiagram } from '../types';

const STORAGE_KEY = 'animation-chart-diagrams';
const ACTIVE_KEY = 'animation-chart-active-diagram';

function nowIso() {
  return new Date().toISOString();
}

function createDiagram(name: string, nameAr: string, nodes: Node<DCNodeData>[], edges: Edge<DCEdgeData>[]): SavedDiagram {
  const ts = nowIso();
  return {
    id: `diagram-${Date.now()}`,
    name,
    nameAr,
    nodes,
    edges,
    createdAt: ts,
    updatedAt: ts,
  };
}

function loadFromStorage(): { diagrams: SavedDiagram[]; activeId: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const activeId = localStorage.getItem(ACTIVE_KEY);
    if (raw) {
      const diagrams = JSON.parse(raw) as SavedDiagram[];
      if (diagrams.length > 0) {
        return { diagrams, activeId: activeId && diagrams.some((d) => d.id === activeId) ? activeId : diagrams[0].id };
      }
    }
  } catch {
    /* ignore */
  }

  const initial = createDiagram(
    enterpriseDataCenter.name,
    enterpriseDataCenter.nameAr,
    enterpriseDataCenter.nodes,
    enterpriseDataCenter.edges,
  );
  return { diagrams: [initial], activeId: initial.id };
}

function persist(diagrams: SavedDiagram[], activeId: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(diagrams));
  localStorage.setItem(ACTIVE_KEY, activeId);
}

export function useDiagramStore() {
  const initial = useRef(loadFromStorage());
  const [diagrams, setDiagrams] = useState<SavedDiagram[]>(initial.current.diagrams);
  const [activeId, setActiveId] = useState(initial.current.activeId);

  const activeDiagram = diagrams.find((d) => d.id === activeId) ?? diagrams[0];

  useEffect(() => {
    persist(diagrams, activeId);
  }, [diagrams, activeId]);

  const updateActiveDiagram = useCallback(
    (nodes: Node<DCNodeData>[], edges: Edge<DCEdgeData>[]) => {
      setDiagrams((prev) =>
        prev.map((d) =>
          d.id === activeId ? { ...d, nodes, edges, updatedAt: nowIso() } : d,
        ),
      );
    },
    [activeId],
  );

  const switchDiagram = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const createNewDiagram = useCallback((name?: string, nameAr?: string) => {
    const n = name ?? `Diagram ${diagrams.length + 1}`;
    const nAr = nameAr ?? `مخطط ${diagrams.length + 1}`;
    const diagram = createDiagram(n, nAr, [], []);
    setDiagrams((prev) => [...prev, diagram]);
    setActiveId(diagram.id);
    return diagram.id;
  }, [diagrams.length]);

  const deleteDiagram = useCallback(
    (id: string) => {
      if (diagrams.length <= 1) return false;
      setDiagrams((prev) => {
        const next = prev.filter((d) => d.id !== id);
        if (activeId === id && next.length > 0) {
          setActiveId(next[0].id);
        }
        return next;
      });
      return true;
    },
    [diagrams.length, activeId],
  );

  const renameDiagram = useCallback((id: string, name: string, nameAr: string) => {
    setDiagrams((prev) =>
      prev.map((d) => (d.id === id ? { ...d, name, nameAr, updatedAt: nowIso() } : d)),
    );
  }, []);

  const duplicateDiagram = useCallback(
    (id: string) => {
      const source = diagrams.find((d) => d.id === id);
      if (!source) return;
      const copy = createDiagram(
        `${source.name} (copy)`,
        `${source.nameAr} (نسخة)`,
        JSON.parse(JSON.stringify(source.nodes)),
        JSON.parse(JSON.stringify(source.edges)),
      );
      setDiagrams((prev) => [...prev, copy]);
      setActiveId(copy.id);
    },
    [diagrams],
  );

  const loadTemplateIntoActive = useCallback(
    (nodes: Node<DCNodeData>[], edges: Edge<DCEdgeData>[], name: string, nameAr: string) => {
      setDiagrams((prev) =>
        prev.map((d) =>
          d.id === activeId
            ? { ...d, nodes, edges, name, nameAr, updatedAt: nowIso() }
            : d,
        ),
      );
    },
    [activeId],
  );

  return {
    diagrams,
    activeDiagram,
    activeId,
    switchDiagram,
    createNewDiagram,
    deleteDiagram,
    renameDiagram,
    duplicateDiagram,
    updateActiveDiagram,
    loadTemplateIntoActive,
  };
}
