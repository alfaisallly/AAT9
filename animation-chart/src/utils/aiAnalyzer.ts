import type { Edge, Node } from '@xyflow/react';
import type {
  AIAnalysisInsight,
  AIAnalysisReport,
  ConnectivityTestResult,
  DCEdgeData,
  DCNodeData,
  EnvironmentConfig,
} from '../types';

export function buildAnalysisContext(
  nodes: Node<DCNodeData>[],
  edges: Edge<DCEdgeData>[],
  testResults: ConnectivityTestResult[],
  env: EnvironmentConfig,
  locale: 'ar' | 'en',
) {
  return JSON.stringify(
    {
      locale,
      environment: env,
      nodes: nodes.map((n) => ({
        id: n.id,
        kind: n.data.kind,
        label: n.data.label,
        ip: n.data.ip,
        status: n.data.status,
        metrics: n.data.metrics,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        linkType: e.data?.linkType,
        bandwidthGbps: e.data?.bandwidthGbps,
        latencyMs: e.data?.latencyMs,
      })),
      testResults,
    },
    null,
    2,
  );
}

export function runLocalAnalysis(
  nodes: Node<DCNodeData>[],
  edges: Edge<DCEdgeData>[],
  testResults: ConnectivityTestResult[],
): AIAnalysisReport {
  const insights: AIAnalysisInsight[] = [];
  const recommendations: string[] = [];
  const recommendationsAr: string[] = [];

  const offline = nodes.filter((n) => n.data.status === 'offline');
  const degraded = nodes.filter((n) => n.data.status === 'degraded');
  const highCpu = nodes.filter((n) => (n.data.metrics?.cpu ?? 0) > 75);

  if (offline.length > 0) {
    insights.push({
      severity: 'critical',
      title: `${offline.length} offline component(s)`,
      titleAr: `${offline.length} مكوّن غير متصل`,
      detail: offline.map((n) => n.data.label).join(', '),
      detailAr: offline.map((n) => n.data.label).join('، '),
    });
    recommendations.push('Restore offline nodes or update diagram to match production state.');
    recommendationsAr.push('أعد المكوّنات غير المتصلة أو حدّث المخطط ليطابق الواقع.');
  }

  if (degraded.length > 0) {
    insights.push({
      severity: 'warning',
      title: 'Degraded performance detected',
      titleAr: 'أداء متدهور',
      detail: degraded.map((n) => n.data.label).join(', '),
      detailAr: degraded.map((n) => n.data.label).join('، '),
    });
  }

  const failedTests = testResults.filter((t) => t.status === 'fail');
  if (failedTests.length > 0) {
    insights.push({
      severity: 'critical',
      title: `${failedTests.length} failed connectivity test(s)`,
      titleAr: `${failedTests.length} اختبار ربط فاشل`,
      detail: failedTests.map((t) => `${t.sourceLabel} → ${t.targetLabel}`).join('; '),
      detailAr: failedTests.map((t) => `${t.sourceLabel} → ${t.targetLabel}`).join('؛ '),
    });
    recommendations.push('Investigate failed links and verify cabling/routing/firewall rules.');
    recommendationsAr.push('تحقق من الروابط الفاشلة وقواعد التوجيه/الجدار الناري.');
  }

  const coreSwitches = nodes.filter((n) => n.data.kind === 'switch');
  if (coreSwitches.length === 1) {
    insights.push({
      severity: 'warning',
      title: 'Single core switch — SPOF risk',
      titleAr: 'مبدّل أساسي واحد — نقطة فشل واحدة',
      detail: 'Add a redundant core switch with stack/vPC link.',
      detailAr: 'أضف مبدّلاً أساسياً احتياطياً مع رابط تكرار.',
    });
    recommendations.push('Deploy dual core switches with cross-links.');
    recommendationsAr.push('انشر مبدّلين أساسيين مع روابط متقاطعة.');
  }

  const firewalls = nodes.filter((n) => n.data.kind === 'firewall');
  if (firewalls.length === 0) {
    insights.push({
      severity: 'warning',
      title: 'No firewall in diagram',
      titleAr: 'لا يوجد جدار ناري في المخطط',
      detail: 'Production DC should include perimeter security.',
      detailAr: 'مركز البيانات الإنتاجي يحتاج أمان محيطي.',
    });
  }

  if (highCpu.length > 0) {
    insights.push({
      severity: 'warning',
      title: 'High CPU utilization',
      titleAr: 'استخدام CPU مرتفع',
      detail: highCpu.map((n) => `${n.data.label} (${n.data.metrics?.cpu}%)`).join(', '),
      detailAr: highCpu.map((n) => `${n.data.label} (${n.data.metrics?.cpu}%)`).join('، '),
    });
    recommendations.push('Scale compute or rebalance workloads on hot nodes.');
    recommendationsAr.push('وسّع السعة أو أعد توزيع الأحمال على الخوادم الساخنة.');
  }

  const networkEdges = edges.filter((e) => e.data?.linkType === 'ethernet' || e.data?.linkType === 'fiber');
  const nodeDegree = new Map<string, number>();
  for (const e of networkEdges) {
    nodeDegree.set(e.source, (nodeDegree.get(e.source) ?? 0) + 1);
    nodeDegree.set(e.target, (nodeDegree.get(e.target) ?? 0) + 1);
  }
  const isolated = nodes.filter(
    (n) => n.data.kind !== 'rack' && n.data.kind !== 'pdu' && n.data.kind !== 'cooling' && (nodeDegree.get(n.id) ?? 0) === 0,
  );
  if (isolated.length > 0) {
    insights.push({
      severity: 'info',
      title: 'Unconnected components',
      titleAr: 'مكوّنات غير مربوطة',
      detail: isolated.map((n) => n.data.label).join(', '),
      detailAr: isolated.map((n) => n.data.label).join('، '),
    });
  }

  let score = 100;
  score -= offline.length * 15;
  score -= degraded.length * 8;
  score -= failedTests.length * 10;
  score -= coreSwitches.length === 1 ? 10 : 0;
  score -= firewalls.length === 0 ? 5 : 0;
  score = Math.max(0, Math.min(100, score));

  if (insights.length === 0) {
    insights.push({
      severity: 'info',
      title: 'Topology looks healthy',
      titleAr: 'البنية تبدو سليمة',
      detail: 'No critical issues detected in current diagram and tests.',
      detailAr: 'لم يُكتشف مشاكل حرجة في المخطط والاختبارات الحالية.',
    });
  }

  return {
    summary: `Infrastructure score ${score}/100. ${insights.length} finding(s).`,
    summaryAr: `درجة البنية ${score}/100. ${insights.length} ملاحظة.`,
    score,
    insights,
    recommendations,
    recommendationsAr,
    source: 'local',
    generatedAt: new Date().toISOString(),
  };
}

export async function runAiAnalysis(
  prompt: string,
  config: EnvironmentConfig,
  locale: 'ar' | 'en',
): Promise<AIAnalysisReport> {
  const res = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: config.aiApiKey,
      model: config.aiModel,
      prompt,
      locale,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `AI error ${res.status}`);
  }

  return res.json() as Promise<AIAnalysisReport>;
}

export async function isApiAvailable(): Promise<boolean> {
  try {
    const res = await fetch('/api/health', { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}
