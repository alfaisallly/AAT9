import { Handle, Position } from '@xyflow/react';
import type { ReactNode } from 'react';
import type { DCNodeData, NodeStatus } from '../../types';

const statusColors: Record<NodeStatus, string> = {
  online: '#22c55e',
  offline: '#ef4444',
  testing: '#f59e0b',
  degraded: '#fb923c',
};

interface BaseNodeProps {
  data: DCNodeData;
  icon: ReactNode;
  accent: string;
  width?: number;
  height?: number;
  showMetrics?: boolean;
}

export function BaseNode({
  data,
  icon,
  accent,
  width = 160,
  height = 72,
  showMetrics = true,
}: BaseNodeProps) {
  const statusColor = statusColors[data.status];

  return (
    <div
      className="dc-node"
      style={{
        width,
        minHeight: height,
        borderColor: accent,
        boxShadow: `0 0 0 1px ${accent}33, 0 8px 24px rgba(0,0,0,0.35)`,
      }}
    >
      <Handle type="target" position={Position.Left} className="dc-handle" />
      <Handle type="source" position={Position.Right} className="dc-handle" />
      <Handle type="target" position={Position.Top} id="top" className="dc-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="dc-handle" />

      <div className="dc-node-header" style={{ background: `${accent}22` }}>
        <span className="dc-node-icon" style={{ color: accent }}>
          {icon}
        </span>
        <div className="dc-node-titles">
          <strong>{data.label}</strong>
          {data.model && <small>{data.model}</small>}
        </div>
        <span className="dc-status-dot" style={{ background: statusColor }} title={data.status} />
      </div>

      <div className="dc-node-body">
        {data.ip && (
          <div className="dc-node-row">
            <span>IP</span>
            <code>{data.ip}</code>
          </div>
        )}
        {data.ports !== undefined && (
          <div className="dc-node-row">
            <span>Ports</span>
            <code>{data.ports}</code>
          </div>
        )}
        {showMetrics && data.metrics && (
          <div className="dc-metrics">
            {data.metrics.cpu !== undefined && (
              <MetricBar label="CPU" value={data.metrics.cpu} color="#38bdf8" />
            )}
            {data.metrics.memory !== undefined && (
              <MetricBar label="RAM" value={data.metrics.memory} color="#a78bfa" />
            )}
            {data.metrics.temperature !== undefined && (
              <div className="dc-node-row">
                <span>Temp</span>
                <code>{data.metrics.temperature}°C</code>
              </div>
            )}
            {data.metrics.powerKw !== undefined && (
              <div className="dc-node-row">
                <span>Power</span>
                <code>{data.metrics.powerKw} kW</code>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="dc-metric-bar">
      <div className="dc-metric-label">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="dc-metric-track">
        <div className="dc-metric-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}
