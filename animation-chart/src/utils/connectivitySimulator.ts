import type { Edge, Node } from '@xyflow/react';
import type { ConnectivityTestResult, DCEdgeData, DCNodeData } from '../types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

export async function runConnectivityTests(
  nodes: Node<DCNodeData>[],
  edges: Edge<DCEdgeData>[],
  onUpdate: (results: ConnectivityTestResult[]) => void,
  signal?: AbortSignal,
): Promise<ConnectivityTestResult[]> {
  const networkEdges = edges.filter(
    (e) => e.data?.linkType === 'ethernet' || e.data?.linkType === 'fiber',
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
    };
  });

  onUpdate([...results]);

  for (let i = 0; i < results.length; i++) {
    if (signal?.aborted) break;

    const edge = networkEdges[i];
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    results[i] = { ...results[i], status: 'running' };
    onUpdate([...results]);

    await sleep(randomBetween(400, 900));
    if (signal?.aborted) break;

    const sourceOffline = sourceNode?.data.status === 'offline';
    const targetOffline = targetNode?.data.status === 'offline';
    const baseLatency = edge.data?.latencyMs ?? randomBetween(0.2, 2);
    const bandwidth = (edge.data?.bandwidthGbps ?? 10) * 1000;

    if (sourceOffline || targetOffline) {
      results[i] = {
        ...results[i],
        status: 'fail',
        latencyMs: undefined,
        packetLoss: 100,
        message: sourceOffline
          ? `Source ${results[i].sourceLabel} unreachable`
          : `Target ${results[i].targetLabel} unreachable`,
      };
    } else {
      const jitter = randomBetween(0.01, 0.4);
      const packetLoss = Math.random() < 0.05 ? randomBetween(0.1, 2) : 0;
      const pass = packetLoss < 1;

      results[i] = {
        ...results[i],
        status: pass ? 'pass' : 'fail',
        latencyMs: baseLatency + jitter,
        jitterMs: jitter,
        packetLoss,
        bandwidthMbps: randomBetween(bandwidth * 0.6, bandwidth * 0.95),
        message: pass ? 'Link operational' : 'Degraded link detected',
      };
    }

    onUpdate([...results]);
  }

  return results;
}

export function summarizeTests(results: ConnectivityTestResult[]) {
  const total = results.length;
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const avgLatency =
    results
      .filter((r) => r.latencyMs !== undefined)
      .reduce((sum, r) => sum + (r.latencyMs ?? 0), 0) /
    Math.max(1, results.filter((r) => r.latencyMs !== undefined).length);

  return { total, passed, failed, avgLatency: Math.round(avgLatency * 100) / 100 };
}
