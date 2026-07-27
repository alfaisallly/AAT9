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

export interface DCNodeData extends Record<string, unknown> {
  kind: ComponentKind;
  label: string;
  ip?: string;
  model?: string;
  ports?: number;
  status: NodeStatus;
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
}

export interface AnimationSettings {
  playing: boolean;
  speed: number;
  showMetrics: boolean;
  showLabels: boolean;
}
