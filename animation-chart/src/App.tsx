import { useCallback, useRef, useState } from 'react';
import type { Edge, Node } from '@xyflow/react';
import { ReactFlowProvider } from '@xyflow/react';
import { Globe, Zap } from 'lucide-react';
import { DiagramCanvas } from './components/DiagramCanvas';
import { Toolbar } from './components/Toolbar';
import { AnimationControls } from './components/AnimationControls';
import { ConnectivityTestPanel } from './components/ConnectivityTestPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { enterpriseDataCenter, templates } from './data/templates';
import { runConnectivityTests } from './utils/connectivitySimulator';
import type {
  AnimationSettings,
  ComponentKind,
  ConnectivityTestResult,
  DCEdgeData,
  DCNodeData,
} from './types';
import './index.css';

let nodeCounter = 0;

function App() {
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [diagramKey, setDiagramKey] = useState(0);
  const [nodes, setNodes] = useState<Node<DCNodeData>[]>(enterpriseDataCenter.nodes);
  const [edges, setEdges] = useState<Edge<DCEdgeData>[]>(enterpriseDataCenter.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<ConnectivityTestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [animation, setAnimation] = useState<AnimationSettings>({
    playing: true,
    speed: 1,
    showMetrics: true,
    showLabels: true,
  });
  const abortRef = useRef<AbortController | null>(null);

  const isAr = locale === 'ar';
  const selectedNode = nodes.find((n) => n.id === selectedNodeId)?.data ?? null;

  const loadTemplate = useCallback((templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    setNodes(template.nodes);
    setEdges(template.edges);
    setSelectedNodeId(null);
    setTestResults([]);
    setDiagramKey((k) => k + 1);
  }, []);

  const addComponent = useCallback((kind: ComponentKind, defaults: Partial<DCNodeData>) => {
    nodeCounter += 1;
    const id = `${kind}-${nodeCounter}`;
    const newNode: Node<DCNodeData> = {
      id,
      type: kind,
      position: { x: 100 + (nodeCounter % 5) * 40, y: 100 + nodeCounter * 30 },
      data: {
        kind,
        label: defaults.label ?? kind,
        status: 'online',
        ...defaults,
      },
    };
    setNodes((prev) => [...prev, newNode]);
  }, []);

  const updateSelectedNode = useCallback(
    (updates: Partial<DCNodeData>) => {
      if (!selectedNodeId) return;
      setNodes((prev) =>
        prev.map((n) =>
          n.id === selectedNodeId ? { ...n, data: { ...n.data, ...updates } } : n,
        ),
      );
    },
    [selectedNodeId],
  );

  const handleRunTests = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setTesting(true);
    setTestResults([]);

    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        data: { ...n.data, status: n.data.status === 'offline' ? 'offline' : 'testing' },
      })),
    );

    await runConnectivityTests(nodes, edges, setTestResults, controller.signal);

    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        data: {
          ...n.data,
          status: n.data.status === 'offline' ? 'offline' : 'online',
        },
      })),
    );
    setTesting(false);
  }, [nodes, edges]);

  return (
    <div className="app" dir={isAr ? 'rtl' : 'ltr'}>
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            <Zap size={22} />
          </div>
          <div>
            <h1>Animation Chart</h1>
            <p>
              {isAr
                ? 'مخططات تقنية متحركة لمراكز البيانات — بدون تعقيد'
                : 'Animated technical diagrams for data centers — no complexity'}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <AnimationControls settings={animation} onChange={setAnimation} locale={locale} />
          <button
            type="button"
            className="locale-btn"
            onClick={() => setLocale((l) => (l === 'ar' ? 'en' : 'ar'))}
          >
            <Globe size={16} />
            {locale === 'ar' ? 'EN' : 'عربي'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <Toolbar onAddComponent={addComponent} onLoadTemplate={loadTemplate} locale={locale} />
        <div className="canvas-area">
          <ReactFlowProvider key={diagramKey}>
            <DiagramCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={setNodes}
              onEdgesChange={setEdges}
              animation={animation}
              testResults={testResults}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
            />
          </ReactFlowProvider>
        </div>
        <div className="right-panels">
          <PropertiesPanel node={selectedNode} onUpdate={updateSelectedNode} locale={locale} />
          <ConnectivityTestPanel
            results={testResults}
            running={testing}
            onRunTests={handleRunTests}
            locale={locale}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
