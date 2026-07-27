import { Brain, Loader2, Sparkles } from 'lucide-react';
import type { AIAnalysisReport } from '../types';

interface AIAnalysisPanelProps {
  report: AIAnalysisReport | null;
  running: boolean;
  locale: 'ar' | 'en';
  hasAiKey: boolean;
  onAnalyze: (useAi: boolean) => void;
}

export function AIAnalysisPanel({
  report,
  running,
  locale,
  hasAiKey,
  onAnalyze,
}: AIAnalysisPanelProps) {
  const isAr = locale === 'ar';

  return (
    <aside className="ai-panel">
      <div className="ai-panel-header">
        <h3>
          <Brain size={16} />
          {isAr ? 'تحليل ذكي' : 'AI Analysis'}
        </h3>
      </div>

      <div className="ai-actions">
        <button type="button" className="control-btn" onClick={() => onAnalyze(false)} disabled={running}>
          {running ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
          {isAr ? 'تحليل محلي' : 'Local analysis'}
        </button>
        <button
          type="button"
          className="run-test-btn"
          onClick={() => onAnalyze(true)}
          disabled={running || !hasAiKey}
        >
          <Brain size={14} />
          {isAr ? 'تحليل AI' : 'AI analysis'}
        </button>
      </div>

      {!hasAiKey && (
        <p className="ai-hint">{isAr ? 'أضف مفتاح OpenAI في إعدادات البيئة لتفعيل AI' : 'Add OpenAI key in Environment settings for AI'}</p>
      )}

      {report && (
        <div className="ai-report">
          <div className="ai-score">
            <span className="score-value">{report.score}</span>
            <span className="score-label">{isAr ? 'درجة البنية' : 'Infra score'}</span>
            <small>{report.source === 'ai' ? 'AI' : isAr ? 'محلي' : 'Local'}</small>
          </div>
          <p className="ai-summary">{isAr ? report.summaryAr : report.summary}</p>

          <div className="ai-insights">
            {report.insights.map((insight, i) => (
              <div key={i} className={`ai-insight ai-${insight.severity}`}>
                <strong>{isAr ? insight.titleAr : insight.title}</strong>
                <p>{isAr ? insight.detailAr : insight.detail}</p>
              </div>
            ))}
          </div>

          {(isAr ? report.recommendationsAr : report.recommendations).length > 0 && (
            <div className="ai-recs">
              <h4>{isAr ? 'توصيات' : 'Recommendations'}</h4>
              <ul>
                {(isAr ? report.recommendationsAr : report.recommendations).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
