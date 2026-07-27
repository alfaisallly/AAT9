import { Cloud, CloudOff, Save, PlugZap } from 'lucide-react';
import type { EnvironmentConfig, EnvironmentMode } from '../types';

interface EnvironmentPanelProps {
  config: EnvironmentConfig;
  apiAvailable: boolean;
  locale: 'ar' | 'en';
  onChange: (config: EnvironmentConfig) => void;
  onSave: () => void;
  onSync: () => void;
  syncing: boolean;
}

export function EnvironmentPanel({
  config,
  apiAvailable,
  locale,
  onChange,
  onSave,
  onSync,
  syncing,
}: EnvironmentPanelProps) {
  const isAr = locale === 'ar';

  return (
    <aside className="env-panel">
      <div className="env-panel-header">
        <h3>
          {config.mode === 'real' ? <Cloud size={16} /> : <CloudOff size={16} />}
          {isAr ? 'البيئة الحقيقية' : 'Real Environment'}
        </h3>
        <span className={`api-badge ${apiAvailable ? 'online' : 'offline'}`}>
          API {apiAvailable ? 'OK' : 'N/A'}
        </span>
      </div>

      <div className="prop-field">
        <label>{isAr ? 'الوضع' : 'Mode'}</label>
        <select
          value={config.mode}
          onChange={(e) => onChange({ ...config, mode: e.target.value as EnvironmentMode })}
        >
          <option value="simulation">{isAr ? 'محاكاة' : 'Simulation'}</option>
          <option value="real" disabled={!apiAvailable}>
            {isAr ? 'بيئة حقيقية' : 'Real'} {!apiAvailable ? (isAr ? '(يتطلب API)' : '(needs API)') : ''}
          </option>
        </select>
      </div>

      <div className="prop-field">
        <label>{isAr ? 'اسم البيئة' : 'Environment name'}</label>
        <input
          value={config.name}
          onChange={(e) => onChange({ ...config, name: e.target.value })}
        />
      </div>

      <div className="prop-field">
        <label>{isAr ? 'Prometheus URL' : 'Prometheus URL'}</label>
        <input
          value={config.prometheusUrl ?? ''}
          onChange={(e) => onChange({ ...config, prometheusUrl: e.target.value })}
          placeholder="http://prometheus:9090"
        />
      </div>

      <div className="prop-field">
        <label>{isAr ? 'منفذ الفحص الافتراضي' : 'Default health port'}</label>
        <input
          type="number"
          value={config.defaultHealthPort}
          onChange={(e) => onChange({ ...config, defaultHealthPort: Number(e.target.value) })}
        />
      </div>

      <div className="prop-field">
        <label>{isAr ? 'مفتاح OpenAI (اختياري)' : 'OpenAI API key (optional)'}</label>
        <input
          type="password"
          value={config.aiApiKey ?? ''}
          onChange={(e) => onChange({ ...config, aiApiKey: e.target.value })}
          placeholder="sk-..."
        />
      </div>

      <div className="prop-field">
        <label>{isAr ? 'نموذج AI' : 'AI model'}</label>
        <input
          value={config.aiModel}
          onChange={(e) => onChange({ ...config, aiModel: e.target.value })}
        />
      </div>

      <div className="env-actions">
        <button type="button" className="control-btn" onClick={onSave}>
          <Save size={14} />
          {isAr ? 'حفظ' : 'Save'}
        </button>
        <button
          type="button"
          className="run-test-btn"
          onClick={onSync}
          disabled={syncing || config.mode !== 'real' || !apiAvailable}
        >
          <PlugZap size={14} />
          {syncing ? (isAr ? 'مزامنة...' : 'Syncing...') : isAr ? 'مزامنة الآن' : 'Sync now'}
        </button>
      </div>

      <p className="env-hint">
        {isAr
          ? 'في الوضع الحقيقي: أدخل IP لكل مكوّن وشغّل الخادم عبر npm run dev:full'
          : 'Real mode: set IP per component and run npm run dev:full'}
      </p>
    </aside>
  );
}
