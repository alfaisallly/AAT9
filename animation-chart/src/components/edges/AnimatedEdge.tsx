import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';
import type { DCEdgeData } from '../../types';

const linkColors: Record<string, string> = {
  ethernet: '#38bdf8',
  fiber: '#a78bfa',
  power: '#facc15',
  management: '#94a3b8',
};

export function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as DCEdgeData | undefined;
  const linkType = edgeData?.linkType ?? 'ethernet';
  const color = linkColors[linkType];
  const animated = edgeData?.animated !== false && linkType !== 'power';
  const testStatus = edgeData?.testStatus ?? 'idle';

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const strokeWidth = selected ? 3 : 2;
  const testGlow =
    testStatus === 'running'
      ? '#f59e0b'
      : testStatus === 'pass'
        ? '#22c55e'
        : testStatus === 'fail'
          ? '#ef4444'
          : undefined;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: testGlow ?? color,
          strokeWidth,
          strokeDasharray: linkType === 'management' ? '6 4' : undefined,
          opacity: linkType === 'power' ? 0.85 : 1,
        }}
      />
      {animated && (
        <circle r="4" fill={color} className="dc-packet">
          <animateMotion dur="2.5s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
      {animated && (
        <circle r="3" fill={color} opacity={0.6} className="dc-packet dc-packet-delay">
          <animateMotion dur="2.5s" begin="0.8s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
      {(edgeData?.label || edgeData?.bandwidthGbps) && (
        <EdgeLabelRenderer>
          <div
            className="dc-edge-label"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
          >
            {edgeData?.label && <span>{edgeData.label}</span>}
            {edgeData?.bandwidthGbps && (
              <small>{edgeData.bandwidthGbps} Gbps</small>
            )}
            {edgeData?.latencyMs !== undefined && (
              <small>{edgeData.latencyMs} ms</small>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const edgeTypes = {
  animated: AnimatedEdge,
};
