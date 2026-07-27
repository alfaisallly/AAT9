import { useCallback, useEffect, useRef, useState } from 'react';
import type { Edge, Node } from '@xyflow/react';
import { ReactFlowProvider } from '@xyflow/react';
import { Globe, Trash2, Zap } from 'lucide-react';
import { DiagramCanvas } from './components/DiagramCanvas';
import { Toolbar } from './components/Toolbar';
import { AnimationControls } from './components/AnimationControls';
import { ConnectivityTestPanel } from './components/ConnectivityTestPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { EnvironmentPanel } from './components/EnvironmentPanel';
import { AIAnalysisPanel } from './components/AIAnalysisPanel';
import { templates } from './data/templates';
import { useDiagramStore } from './hooks/useDiagramStore';
import {
  buildAnalysisContext,
  isApiAvailable,
  runAiAnalysis,
  runLocalAnalysis,
} from './utils/aiAnalyzer';
import {
  loadEnvironmentConfig,
  runEnvironmentTests,
  saveEnvironmentConfig,
} from './utils/realEnvironment';
import type {
  AIAnalysisReport,
  AnimationSettings,
  ComponentKind,
  ConnectivityTestResult,
  DCEdgeData,
  DCNodeData,
  EnvironmentConfig,
} from './types';
import './index.css';

let nodeCounter = 0;

function App() {
  const {
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
  } = useDiagramStore();

  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [diagramKey, setDiagramKey] = useState(0);
  const [nodes, setNodes] = useState<Node<DCNodeData>[]>(activeDiagram.nodes);
  const [edges, setEdges] = useState<Edge<DCEdgeData>[]>(activeDiagram.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<ConnectivityTestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [aiRunning, setAiRunning] = useState(false);
  const [aiReport, setAiReport] = useState<AIAnalysisReport | null>(null);
  const [envConfig, setEnvConfig] = useState<EnvironmentConfig>(loadEnvironmentConfig);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [rightTab, setRightTab] = useState<'props' | 'env' | 'ai'>('props');
  const [animation, setAnimation] = useState<AnimationSettings>({
    playing: true,
    speed: 1,
    showMetrics: true,
    showLabels: true,
  });

  const abortRef = useRef<AbortController | null>(null);
  const saveTimer = useRef<number | null>(null);
  const isAr = locale === 'ar';

  useEffect(() => {
    isApiAvailable().then(setApiAvailable);
  }, []);

  const prevActiveId = useRef(activeId);

  useEffect(() => {
    if (prevActiveId.current === activeId) return;
    prevActiveId.current = activeId;
    const diagram = diagrams.find((d) => d.id === activeId);
    if (!diagram) return;
    setNodes(diagram.nodes);
    setEdges(diagram.edges);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setTestResults([]);
    setAiReport(null);
    setDiagramKey((k) => k + 1);
  }, [activeId, diagrams]);

  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      updateActiveDiagram(nodes, edges);
    }, 400);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [nodes, edges, updateActiveDiagram]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId)?.data ?? null;

  const setNodesAndSave = useCallback((next: Node<DCNodeData>[]) => setNodes(next), []);
  const setEdgesAndSave = useCallback((next: Edge<DCEdgeData>[]) => setEdges(next), []);

  const loadTemplate = useCallback(
    (templateId: string) => {
      const template = templates.find((t) => t.id === templateId);
      if (!template) return;
      loadTemplateIntoActive(template.nodes, template.edges, template.name, template.nameAr);
      setNodes(template.nodes);
      setEdges(template.edges);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setTestResults([]);
      setDiagramKey((k) => k + 1);
    },
    [loadTemplateIntoActive],
  );

  const addComponent = useCallback((kind: ComponentKind, defaults: Partial<DCNodeData>) => {
    nodeCounter += 1;
    const id = `${kind}-${nodeCounter}`;
    const newNode: Node<DCNodeData> = {
      id,
      type: kind,
      position: { x: 100 + (nodeCounter % 5) * 40, y: 100 + nodeCounter * 30 },
      data: { kind, label: defaults.label ?? kind, status: 'online', ...defaults },
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

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNodeId) return;
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setEdges((prev) => prev.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
  }, [selectedNodeId]);

  const deleteSelectedEdge = useCallback(() => {
    if (!selectedEdgeId) return;
    setEdges((prev) => prev.filter((e) => e.id !== selectedEdgeId));
    setSelectedEdgeId(null);
  }, [selectedEdgeId]);

  const applyNodeStatuses = useCallback(
    (updates: Array<{ id: string; status: DCNodeData['status'] }>) => {
      setNodes((prev) =>
        prev.map((n) => {
          const u = updates.find((x) => x.id === n.id);
          return u ? { ...n, data: { ...n.data, status: u.status } } : n;
        }),
      );
    },
    [],
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

    try {
      await runEnvironmentTests(
        envConfig.mode,
        nodes,
        edges,
        setTestResults,
        applyNodeStatuses,
        envConfig,
        controller.signal,
      );
    } catch {
      setTestResults([]);
    }

    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        data: {
          ...n.data,
          status: n.data.status === 'testing' ? 'online' : n.data.status,
        },
      })),
    );
    setTesting(false);
  }, [nodes, edges, envConfig, applyNodeStatuses]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      await handleRunTests();
    } finally {
      setSyncing(false);
    }
  }, [handleRunTests]);

  const handleSaveEnv = useCallback(() => {
    saveEnvironmentConfig(envConfig);
  }, [envConfig]);

  const handleAnalyze = useCallback(
    async (useAi: boolean) => {
      setAiRunning(true);
      try {
        if (useAi && envConfig.aiApiKey) {
          const prompt = buildAnalysisContext(nodes, edges, testResults, envConfig, locale);
          const report = await runAiAnalysis(prompt, envConfig, locale);
          setAiReport(report);
        } else {
          setAiReport(runLocalAnalysis(nodes, edges, testResults));
        }
        setRightTab('ai');
      } catch (err) {
        setAiReport({
          ...runLocalAnalysis(nodes, edges, testResults),
          summary: err instanceof Error ? err.message : 'AI failed, showing local analysis',
          summaryAr: 'فشل AI — عرض التحليل المحلي',
        });
        setRightTab('ai');
      } finally {
        setAiRunning(false);
      }
    },
    [nodes, edges, testResults, envConfig, locale],
  );

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
                ? 'مخططات متحركة · إدارة · بيئة حقيقية · تحليل AI'
                : 'Animated diagrams · CRUD · real env · AI analysis'}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <AnimationControls settings={animation} onChange={setAnimation} locale={locale} />
          <button type="button" className="locale-btn" onClick={() => setLocale((l) => (l === 'ar' ? 'en' : 'ar'))}>
            <Globe size={16} />
            {locale === 'ar' ? 'EN' : 'عربي'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <Toolbar
          diagrams={diagrams}
          activeDiagramId={activeId}
          onAddComponent={addComponent}
          onLoadTemplate={loadTemplate}
          onSwitchDiagram={switchDiagram}
          onCreateDiagram={() => createNewDiagram()}
          onDeleteDiagram={deleteDiagram}
          onRenameDiagram={renameDiagram}
          onDuplicateDiagram={duplicateDiagram}
          locale={locale}
        />
        <div className="canvas-area">
          {selectedEdgeId && (
            <div className="canvas-toolbar">
              <span>{isAr ? 'رابط محدد' : 'Edge selected'}</span>
              <button type="button" className="icon-btn danger" onClick={deleteSelectedEdge}>
                <Trash2 size={14} />
                {isAr ? 'حذف الرابط' : 'Delete link'}
              </button>
            </div>
          )}
          <ReactFlowProvider key={diagramKey}>
            <DiagramCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={setNodesAndSave}
              onEdgesChange={setEdgesAndSave}
              animation={animation}
              testResults={testResults}
              selectedNodeId={selectedNodeId}
              selectedEdgeId={selectedEdgeId}
              onSelectNode={setSelectedNodeId}
              onSelectEdge={setSelectedEdgeId}
            />
          </ReactFlowProvider>
        </div>
        <div className="right-panels">
          <div className="panel-tabs">
            <button type="button" className={rightTab === 'props' ? 'active' : ''} onClick={() => setRightTab('props')}>
              {isAr ? 'خصائص' : 'Props'}
            </button>
            <button type="button" className={rightTab === 'env' ? 'active' : ''} onClick={() => setRightTab('env')}>
              {isAr ? 'البيئة' : 'Env'}
            </button>
            <button type="button" className={rightTab === 'ai' ? 'active' : ''} onClick={() => setRightTab('ai')}>
              AI
            </button>
          </div>
          {rightTab === 'props' && (
            <PropertiesPanel
              node={selectedNode}
              nodeId={selectedNodeId}
              onUpdate={updateSelectedNode}
              onDelete={deleteSelectedNode}
              locale={locale}
            />
          )}
          {rightTab === 'env' && (
            <EnvironmentPanel
              config={envConfig}
              apiAvailable={apiAvailable}
              locale={locale}
              onChange={setEnvConfig}
              onSave={handleSaveEnv}
              onSync={handleSync}
              syncing={syncing}
            />
          )}
          {rightTab === 'ai' && (
            <AIAnalysisPanel
              report={aiReport}
              running={aiRunning}
              locale={locale}
              hasAiKey={Boolean(envConfig.aiApiKey)}
              onAnalyze={handleAnalyze}
            />
          )}
          <ConnectivityTestPanel
            results={testResults}
            running={testing}
            mode={envConfig.mode}
            onRunTests={handleRunTests}
            locale={locale}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
