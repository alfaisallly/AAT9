import { Activity, CheckCircle2, XCircle, Loader2, Radio } from 'lucide-react';
import type { ConnectivityTestResult, EnvironmentMode } from '../types';
import { summarizeTests } from '../utils/connectivitySimulator';

interface ConnectivityTestPanelProps {
  results: ConnectivityTestResult[];
  running: boolean;
  mode: EnvironmentMode;
  locale: 'ar' | 'en';
  onRunTests: () => void;
}

export function ConnectivityTestPanel({
  results,
  running,
  mode,
  onRunTests,
  locale,
}: ConnectivityTestPanelProps) {
  const isAr = locale === 'ar';
  const summary = summarizeTests(results);
  const isReal = mode === 'real';

  return (
    <aside className="test-panel">
      <div className="test-panel-header">
        <h3>
          <Radio size={16} />
          {isAr ? 'اختبار الربط' : 'Connectivity Tests'}
          <span className={`mode-tag ${isReal ? 'real' : 'sim'}`}>
            {isReal ? (isAr ? 'حقيقي' : 'Real') : isAr ? 'محاكاة' : 'Sim'}
          </span>
        </h3>
        <button type="button" className="run-test-btn" onClick={onRunTests} disabled={running}>
          {running ? <Loader2 size={16} className="spin" /> : <Activity size={16} />}
          {running ? (isAr ? 'جاري الاختبار...' : 'Testing...') : isAr ? 'تشغيل الاختبار' : 'Run Tests'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="test-summary">
          <div className="summary-stat pass">
            <CheckCircle2 size={14} />
            {summary.passed} {isAr ? 'ناجح' : 'pass'}
          </div>
          <div className="summary-stat fail">
            <XCircle size={14} />
            {summary.failed} {isAr ? 'فاشل' : 'fail'}
          </div>
          <div className="summary-stat">
            {isAr ? 'متوسط التأخير' : 'Avg latency'}: {summary.avgLatency} ms
          </div>
        </div>
      )}

      <div className="test-results">
        {results.length === 0 ? (
          <p className="test-empty">
            {isReal
              ? isAr
                ? 'يُفحص IP الحقيقي لكل مكوّن عبر ping/HTTP.'
                : 'Probes real IP/health URL per component via ping/HTTP.'
              : isAr
                ? 'شغّل الاختبار للتحقق من جميع روابط الشبكة بين المكوّنات.'
                : 'Run tests to verify all network links between components.'}
          </p>
        ) : (
          results.map((result) => (
            <div key={result.id} className={`test-result test-${result.status}`}>
              <div className="test-result-route">
                {statusIcon(result.status)}
                <span>
                  {result.sourceLabel} → {result.targetLabel}
                  {result.realProbe && <small className="real-badge">LIVE</small>}
                </span>
              </div>
              {result.status !== 'pending' && result.status !== 'running' && (
                <div className="test-result-metrics">
                  {result.latencyMs !== undefined && <span>{result.latencyMs} ms</span>}
                  {result.packetLoss !== undefined && <span>{result.packetLoss}% loss</span>}
                  {result.bandwidthMbps !== undefined && (
                    <span>{Math.round(result.bandwidthMbps)} Mbps</span>
                  )}
                </div>
              )}
              {result.message && result.status !== 'running' && <small>{result.message}</small>}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

function statusIcon(status: ConnectivityTestResult['status']) {
  switch (status) {
    case 'pass':
      return <CheckCircle2 size={14} className="icon-pass" />;
    case 'fail':
      return <XCircle size={14} className="icon-fail" />;
    case 'running':
      return <Loader2 size={14} className="spin icon-running" />;
    default:
      return <span className="icon-pending" />;
  }
}
