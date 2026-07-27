import type { Edge, Node } from '@xyflow/react';
import type {
  ConnectivityTestResult,
  DCEdgeData,
  DCNodeData,
  EnvironmentConfig,
  RealProbeResult,
} from '../types';
import { runConnectivityTests } from './connectivitySimulator';

const ENV_STORAGE = 'animation-chart-environment';

export function loadEnvironmentConfig(): EnvironmentConfig {
  try {
    const raw = localStorage.getItem(ENV_STORAGE);
    if (raw) return JSON.parse(raw) as EnvironmentConfig;
  } catch {
    /* ignore */
  }
  return {
    mode: 'simulation',
    name: 'Production DC',
    defaultHealthPort: 80,
    aiModel: 'gpt-4o-mini',
  };
}

export function saveEnvironmentConfig(config: EnvironmentConfig) {
  localStorage.setItem(ENV_STORAGE, JSON.stringify(config));
}

function resolveHost(node: Node<DCNodeData>): string | undefined {
  return node.data.realHost || node.data.ip;
}

function resolveHealthUrl(node: Node<DCNodeData>, config: EnvironmentConfig): string | undefined {
  if (node.data.healthUrl) return node.data.healthUrl;
  const host = resolveHost(node);
  if (!host) return undefined;
  if (host.startsWith('http')) return host;
  return `http://${host}:${config.defaultHealthPort}/`;
}

export async function probeRealHost(
  node: Node<DCNodeData>,
  config: EnvironmentConfig,
): Promise<RealProbeResult> {
  const host = resolveHost(node);
  if (!host) {
    return { host: node.data.label, reachable: false, message: 'No IP configured' };
  }

  const res = await fetch('/api/probe/host', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: host.replace(/^https?:\/\//, '').split('/')[0],
      healthUrl: resolveHealthUrl(node, config),
    }),
  });

  if (!res.ok) throw new Error(`Probe failed: ${res.status}`);
  return res.json() as Promise<RealProbeResult>;
}

export async function runRealConnectivityTests(
  nodes: Node<DCNodeData>[],
  edges: Edge<DCEdgeData>[],
  onUpdate: (results: ConnectivityTestResult[]) => void,
  onNodeStatus: (updates: Array<{ id: string; status: DCNodeData['status']; metrics?: DCNodeData['metrics'] }>) => void,
  config: EnvironmentConfig,
  signal?: AbortSignal,
): Promise<ConnectivityTestResult[]> {
  const networkEdges = edges.filter(
    (e) => e.data?.linkType === 'ethernet' || e.data?.linkType === 'fiber',
  );

  const probeTargets = nodes
    .filter((n) => resolveHost(n))
    .map((n) => ({
      nodeId: n.id,
      host: resolveHost(n)!,
      healthUrl: resolveHealthUrl(n, config),
    }));

  onUpdate([]);
  if (signal?.aborted) return [];

  const batchRes = await fetch('/api/probe/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targets: probeTargets }),
    signal,
  });

  if (!batchRes.ok) throw new Error('Real environment API unavailable');

  const { results: probeResults } = (await batchRes.json()) as {
    results: Array<{ nodeId: string; reachable: boolean; latencyMs?: number; packetLoss?: number; message: string }>;
  };

  const probeMap = new Map(probeResults.map((r) => [r.nodeId, r]));

  onNodeStatus(
    nodes.map((n) => {
      const probe = probeMap.get(n.id);
      if (!probe) return { id: n.id, status: n.data.status };
      return {
        id: n.id,
        status: probe.reachable ? 'online' : 'offline',
        metrics: probe.latencyMs
          ? { ...n.data.metrics, cpu: n.data.metrics?.cpu }
          : n.data.metrics,
      };
    }),
  );

  const results: ConnectivityTestResult[] = networkEdges.map((edge) => {
    const source = nodes.find((n) => n.id === edge.source);
    const target = nodes.find((n) => n.id === edge.target);
    return {
      id: edge.id,
      sourceId: edge.source,
      targetId: edge.target,
      sourceLabel: source?.data.label ?? edge.source,
      targetLabel: target?.data.label ?? edge.target,
      status: 'pending',
      realProbe: true,
    };
  });

  onUpdate([...results]);

  for (let i = 0; i < results.length; i++) {
    if (signal?.aborted) break;

    const edge = networkEdges[i];
    const source = nodes.find((n) => n.id === edge.source);
    const target = nodes.find((n) => n.id === edge.target);
    const srcHost = source ? resolveHost(source) : undefined;
    const tgtHost = target ? resolveHost(target) : undefined;

    results[i] = { ...results[i], status: 'running' };
    onUpdate([...results]);

    if (!srcHost || !tgtHost) {
      results[i] = {
        ...results[i],
        status: 'fail',
        message: 'Missing IP on source or target',
      };
      onUpdate([...results]);
      continue;
    }

    try {
      const linkRes = await fetch('/api/probe/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceHost: srcHost, targetHost: tgtHost }),
        signal,
      });
      const linkData = await linkRes.json();
      results[i] = {
        ...results[i],
        status: linkData.status === 'pass' ? 'pass' : 'fail',
        latencyMs: linkData.latencyMs,
        packetLoss: linkData.packetLoss,
        message: linkData.message,
        realProbe: true,
      };
    } catch {
      results[i] = {
        ...results[i],
        status: 'fail',
        message: 'Link probe failed',
      };
    }
    onUpdate([...results]);
  }

  return results;
}

export async function runEnvironmentTests(
  mode: EnvironmentConfig['mode'],
  nodes: Node<DCNodeData>[],
  edges: Edge<DCEdgeData>[],
  onUpdate: (results: ConnectivityTestResult[]) => void,
  onNodeStatus: (updates: Array<{ id: string; status: DCNodeData['status'] }>) => void,
  config: EnvironmentConfig,
  signal?: AbortSignal,
): Promise<ConnectivityTestResult[]> {
  if (mode === 'real') {
    return runRealConnectivityTests(nodes, edges, onUpdate, onNodeStatus, config, signal);
  }
  return runConnectivityTests(nodes, edges, onUpdate, signal);
}
