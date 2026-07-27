import {
  Server,
  Network,
  Router,
  Shield,
  Scale,
  Database,
  Zap,
  Wind,
  Layers,
} from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { DCNodeData } from '../../types';

type NodeProps = { data: DCNodeData };

export function RackNode({ data }: NodeProps) {
  return <BaseNode data={data} icon={<Layers size={18} />} accent="#64748b" width={180} height={90} />;
}

export function ServerNode({ data }: NodeProps) {
  return <BaseNode data={data} icon={<Server size={18} />} accent="#0ea5e9" />;
}

export function SwitchNode({ data }: NodeProps) {
  return <BaseNode data={data} icon={<Network size={18} />} accent="#8b5cf6" />;
}

export function RouterNode({ data }: NodeProps) {
  return <BaseNode data={data} icon={<Router size={18} />} accent="#06b6d4" />;
}

export function FirewallNode({ data }: NodeProps) {
  return <BaseNode data={data} icon={<Shield size={18} />} accent="#f97316" showMetrics={false} />;
}

export function LoadBalancerNode({ data }: NodeProps) {
  return <BaseNode data={data} icon={<Scale size={18} />} accent="#ec4899" showMetrics={false} />;
}

export function StorageNode({ data }: NodeProps) {
  return <BaseNode data={data} icon={<Database size={18} />} accent="#14b8a6" />;
}

export function PDUNode({ data }: NodeProps) {
  return <BaseNode data={data} icon={<Zap size={18} />} accent="#eab308" showMetrics={true} />;
}

export function CoolingNode({ data }: NodeProps) {
  return <BaseNode data={data} icon={<Wind size={18} />} accent="#22d3ee" showMetrics={true} />;
}

export const nodeTypes = {
  rack: RackNode,
  server: ServerNode,
  switch: SwitchNode,
  router: RouterNode,
  firewall: FirewallNode,
  loadbalancer: LoadBalancerNode,
  storage: StorageNode,
  pdu: PDUNode,
  cooling: CoolingNode,
};
