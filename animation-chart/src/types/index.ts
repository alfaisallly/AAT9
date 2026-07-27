export type ComponentKind =
  | 'rack'
  | 'server'
  | 'switch'
  | 'router'
  | 'firewall'
  | 'loadbalancer'
  | 'storage'
  | 'pdu'
  | 'cooling';

export type NodeStatus = 'online' | 'offline' | 'testing' | 'degraded';

export type LinkType = 'ethernet' | 'fiber' | 'power' | 'management';

export type EnvironmentMode = 'simulation' | 'real';

export interface DCNodeData extends Record<string, unknown> {
  kind: ComponentKind;
  label: string;
  ip?: string;
  model?: string;
  ports?: number;
  status: NodeStatus;
  healthUrl?: string;
  realHost?: string;
  metrics?: {
    cpu?: number;
    memory?: number;
    temperature?: number;
    powerKw?: number;
  };
}

export interface DCEdgeData extends Record<string, unknown> {
  linkType: LinkType;
  bandwidthGbps?: number;
  latencyMs?: number;
  label?: string;
  animated: boolean;
  testStatus?: 'idle' | 'running' | 'pass' | 'fail';
}

export interface ConnectivityTestResult {
  id: string;
  sourceId: string;
  targetId: string;
  sourceLabel: string;
  targetLabel: string;
  status: 'pending' | 'running' | 'pass' | 'fail';
  latencyMs?: number;
  packetLoss?: number;
  jitterMs?: number;
  bandwidthMbps?: number;
  message?: string;
  realProbe?: boolean;
}

export interface AnimationSettings {
  playing: boolean;
  speed: number;
  showMetrics: boolean;
  showLabels: boolean;
}

export interface EnvironmentConfig {
  mode: EnvironmentMode;
  name: string;
  prometheusUrl?: string;
  snmpCommunity?: string;
  defaultHealthPort: number;
  aiApiKey?: string;
  aiModel: string;
}

export interface SavedDiagram {
  id: string;
  name: string;
  nameAr: string;
  nodes: import('@xyflow/react').Node<DCNodeData>[];
  edges: import('@xyflow/react').Edge<DCEdgeData>[];
  createdAt: string;
  updatedAt: string;
}

export interface RealProbeResult {
  host: string;
  reachable: boolean;
  latencyMs?: number;
  packetLoss?: number;
  httpStatus?: number;
  message: string;
}

export interface AIAnalysisInsight {
  severity: 'info' | 'warning' | 'critical';
  title: string;
  titleAr: string;
  detail: string;
  detailAr: string;
}

export interface AIAnalysisReport {
  summary: string;
  summaryAr: string;
  score: number;
  insights: AIAnalysisInsight[];
  recommendations: string[];
  recommendationsAr: string[];
  source: 'local' | 'ai';
  generatedAt: string;
}
