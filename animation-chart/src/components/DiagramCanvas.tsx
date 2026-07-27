import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes';
import { edgeTypes } from './edges/AnimatedEdge';
import type { AnimationSettings, ConnectivityTestResult, DCEdgeData, DCNodeData } from '../types';

interface DiagramCanvasProps {
  nodes: Node<DCNodeData>[];
  edges: Edge<DCEdgeData>[];
  onNodesChange: (nodes: Node<DCNodeData>[]) => void;
  onEdgesChange: (edges: Edge<DCEdgeData>[]) => void;
  animation: AnimationSettings;
  testResults: ConnectivityTestResult[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onSelectNode: (id: string | null) => void;
  onSelectEdge: (id: string | null) => void;
}

export function DiagramCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  animation,
  testResults,
  selectedNodeId,
  selectedEdgeId,
  onSelectNode,
  onSelectEdge,
}: DiagramCanvasProps) {
  const testMap = new Map(testResults.map((r) => [r.id, r.status]));

  const displayEdges = edges.map((edge) => ({
    ...edge,
    selected: edge.id === selectedEdgeId,
    data: {
      ...edge.data,
      linkType: edge.data?.linkType ?? 'ethernet',
      animated: animation.playing && edge.data?.animated !== false,
      testStatus: testMap.get(edge.id) ?? edge.data?.testStatus ?? 'idle',
    },
  }));

  const displayNodes = nodes.map((node) => ({
    ...node,
    selected: node.id === selectedNodeId,
  }));

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(applyNodeChanges(changes, nodes) as Node<DCNodeData>[]);
    },
    [nodes, onNodesChange],
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(applyEdgeChanges(changes, edges) as Edge<DCEdgeData>[]);
    },
    [edges, onEdgesChange],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const newEdge: Edge<DCEdgeData> = {
        id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: 'animated',
        data: {
          linkType: 'ethernet',
          animated: true,
          bandwidthGbps: 10,
          latencyMs: 0.5,
        },
      };
      onEdgesChange(addEdge(newEdge, edges));
    },
    [edges, onEdgesChange],
  );

  return (
    <div
      className="diagram-canvas"
      style={{ '--anim-speed': `${2.5 / animation.speed}s` } as React.CSSProperties}
    >
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => {
          onSelectEdge(null);
          onSelectNode(node.id);
        }}
        onEdgeClick={(_, edge) => {
          onSelectNode(null);
          onSelectEdge(edge.id);
        }}
        onPaneClick={() => {
          onSelectNode(null);
          onSelectEdge(null);
        }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            const kind = (n.data as DCNodeData)?.kind;
            const colors: Record<string, string> = {
              server: '#0ea5e9',
              switch: '#8b5cf6',
              router: '#06b6d4',
              firewall: '#f97316',
              storage: '#14b8a6',
              rack: '#64748b',
            };
            return colors[kind] ?? '#475569';
          }}
          maskColor="rgba(15, 23, 42, 0.75)"
        />
      </ReactFlow>
    </div>
  );
}
