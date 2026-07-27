import type { Edge, Node } from '@xyflow/react';
import type { DCEdgeData, DCNodeData } from '../types';

export interface DiagramTemplate {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  nodes: Node<DCNodeData>[];
  edges: Edge<DCEdgeData>[];
}

const baseNode = (
  id: string,
  kind: DCNodeData['kind'],
  label: string,
  x: number,
  y: number,
  extra: Partial<DCNodeData> = {},
): Node<DCNodeData> => ({
  id,
  type: kind,
  position: { x, y },
  data: {
    kind,
    label,
    status: 'online',
    ...extra,
  },
});

const baseEdge = (
  id: string,
  source: string,
  target: string,
  linkType: DCEdgeData['linkType'],
  extra: Partial<DCEdgeData> = {},
): Edge<DCEdgeData> => ({
  id,
  source,
  target,
  type: 'animated',
  data: {
    linkType,
    animated: true,
    ...extra,
  },
});

export const enterpriseDataCenter: DiagramTemplate = {
  id: 'enterprise-dc',
  name: 'Enterprise Data Center',
  nameAr: 'مركز بيانات مؤسسي',
  description: 'Full rack layout with core networking, storage, and redundancy paths.',
  descriptionAr: 'تخطيط كامل للرفوف مع الشبكة الأساسية والتخزين ومسارات التكرار.',
  nodes: [
    baseNode('rack-a1', 'rack', 'Rack A1 — Compute', 80, 80, {
      model: '42U NetShelter',
      ports: 42,
      metrics: { powerKw: 12.4, temperature: 22 },
    }),
    baseNode('rack-a2', 'rack', 'Rack A2 — Compute', 80, 280, {
      model: '42U NetShelter',
      ports: 42,
      metrics: { powerKw: 11.8, temperature: 23 },
    }),
    baseNode('rack-b1', 'rack', 'Rack B1 — Storage', 80, 480, {
      model: '42U Storage Bay',
      ports: 36,
      metrics: { powerKw: 9.2, temperature: 21 },
    }),

    baseNode('srv-web-01', 'server', 'Web-01', 120, 120, {
      ip: '10.0.1.11',
      model: 'Dell R750',
      metrics: { cpu: 34, memory: 58, temperature: 41 },
    }),
    baseNode('srv-web-02', 'server', 'Web-02', 120, 160, {
      ip: '10.0.1.12',
      model: 'Dell R750',
      metrics: { cpu: 29, memory: 52, temperature: 39 },
    }),
    baseNode('srv-db-01', 'server', 'DB-Primary', 120, 320, {
      ip: '10.0.2.10',
      model: 'HP DL380',
      metrics: { cpu: 61, memory: 74, temperature: 44 },
    }),
    baseNode('srv-db-02', 'server', 'DB-Replica', 120, 360, {
      ip: '10.0.2.11',
      model: 'HP DL380',
      metrics: { cpu: 48, memory: 69, temperature: 42 },
    }),

    baseNode('core-sw-01', 'switch', 'Core Switch 01', 420, 180, {
      ip: '10.0.0.10',
      model: 'Cisco Nexus 9300',
      ports: 48,
      metrics: { cpu: 22, temperature: 36 },
    }),
    baseNode('core-sw-02', 'switch', 'Core Switch 02', 420, 380, {
      ip: '10.0.0.11',
      model: 'Cisco Nexus 9300',
      ports: 48,
      metrics: { cpu: 19, temperature: 35 },
    }),
    baseNode('edge-rtr', 'router', 'Edge Router', 680, 80, {
      ip: '203.0.113.1',
      model: 'Juniper MX204',
      ports: 8,
    }),
    baseNode('fw-main', 'firewall', 'Firewall Cluster', 680, 220, {
      ip: '10.0.0.5',
      model: 'Palo Alto PA-5220',
    }),
    baseNode('lb-01', 'loadbalancer', 'Load Balancer', 680, 360, {
      ip: '10.0.0.20',
      model: 'F5 BIG-IP',
    }),
    baseNode('san-01', 'storage', 'SAN Array', 420, 520, {
      ip: '10.0.3.10',
      model: 'NetApp AFF A400',
      metrics: { cpu: 18, memory: 42, temperature: 28 },
    }),
    baseNode('pdu-a', 'pdu', 'PDU Row A', 260, 40, {
      model: 'APC 9000',
      metrics: { powerKw: 24.2 },
    }),
    baseNode('cooling', 'cooling', 'CRAC Unit', 260, 600, {
      model: 'Liebert CRV',
      metrics: { temperature: 18, powerKw: 6.5 },
    }),
  ],
  edges: [
    baseEdge('e-web-lb', 'srv-web-01', 'lb-01', 'ethernet', {
      bandwidthGbps: 10,
      latencyMs: 0.4,
      label: 'HTTP',
    }),
    baseEdge('e-web2-lb', 'srv-web-02', 'lb-01', 'ethernet', {
      bandwidthGbps: 10,
      latencyMs: 0.5,
      label: 'HTTP',
    }),
    baseEdge('e-lb-fw', 'lb-01', 'fw-main', 'ethernet', {
      bandwidthGbps: 25,
      latencyMs: 0.3,
    }),
    baseEdge('e-fw-rtr', 'fw-main', 'edge-rtr', 'fiber', {
      bandwidthGbps: 40,
      latencyMs: 0.2,
      label: 'WAN',
    }),
    baseEdge('e-web-sw', 'srv-web-01', 'core-sw-01', 'ethernet', {
      bandwidthGbps: 25,
      latencyMs: 0.2,
    }),
    baseEdge('e-web2-sw', 'srv-web-02', 'core-sw-01', 'ethernet', {
      bandwidthGbps: 25,
      latencyMs: 0.2,
    }),
    baseEdge('e-db-sw', 'srv-db-01', 'core-sw-02', 'ethernet', {
      bandwidthGbps: 25,
      latencyMs: 0.3,
    }),
    baseEdge('e-db2-sw', 'srv-db-02', 'core-sw-02', 'ethernet', {
      bandwidthGbps: 25,
      latencyMs: 0.3,
    }),
    baseEdge('e-sw-stack', 'core-sw-01', 'core-sw-02', 'fiber', {
      bandwidthGbps: 100,
      latencyMs: 0.1,
      label: 'Stack Link',
    }),
    baseEdge('e-db-repl', 'srv-db-01', 'srv-db-02', 'fiber', {
      bandwidthGbps: 40,
      latencyMs: 0.15,
      label: 'Replication',
    }),
    baseEdge('e-sw-san', 'core-sw-02', 'san-01', 'fiber', {
      bandwidthGbps: 32,
      latencyMs: 0.25,
      label: 'iSCSI',
    }),
    baseEdge('e-pdu-a1', 'pdu-a', 'rack-a1', 'power', {
      label: 'Power Feed A',
      animated: false,
    }),
    baseEdge('e-pdu-a2', 'pdu-a', 'rack-a2', 'power', {
      label: 'Power Feed A',
      animated: false,
    }),
    baseEdge('e-cool-b1', 'cooling', 'rack-b1', 'management', {
      label: 'Thermal Mgmt',
      animated: false,
    }),
  ],
};

export const templates: DiagramTemplate[] = [enterpriseDataCenter];

export const componentPalette: Array<{
  kind: DCNodeData['kind'];
  label: string;
  labelAr: string;
  defaultData: Partial<DCNodeData>;
}> = [
  { kind: 'rack', label: 'Server Rack', labelAr: 'رف خوادم', defaultData: { model: '42U Rack', ports: 42 } },
  { kind: 'server', label: 'Server', labelAr: 'خادم', defaultData: { ip: '10.0.0.10', model: 'Dell R750' } },
  { kind: 'switch', label: 'Switch', labelAr: 'مبدّل', defaultData: { ip: '10.0.0.1', model: 'Nexus 9300', ports: 48 } },
  { kind: 'router', label: 'Router', labelAr: 'موجّه', defaultData: { ip: '10.0.0.254', model: 'MX204', ports: 8 } },
  { kind: 'firewall', label: 'Firewall', labelAr: 'جدار ناري', defaultData: { ip: '10.0.0.5', model: 'PA-5220' } },
  { kind: 'loadbalancer', label: 'Load Balancer', labelAr: 'موازن حمل', defaultData: { ip: '10.0.0.20', model: 'F5 BIG-IP' } },
  { kind: 'storage', label: 'Storage', labelAr: 'تخزين', defaultData: { ip: '10.0.3.10', model: 'NetApp AFF' } },
  { kind: 'pdu', label: 'PDU', labelAr: 'وحدة طاقة', defaultData: { model: 'APC PDU', metrics: { powerKw: 8 } } },
  { kind: 'cooling', label: 'Cooling', labelAr: 'تبريد', defaultData: { model: 'CRAC Unit', metrics: { temperature: 18 } } },
];
