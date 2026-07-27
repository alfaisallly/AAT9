import { Play, Pause, Gauge, Eye, EyeOff } from 'lucide-react';
import type { AnimationSettings } from '../types';

interface AnimationControlsProps {
  settings: AnimationSettings;
  onChange: (settings: AnimationSettings) => void;
  locale: 'ar' | 'en';
}

export function AnimationControls({ settings, onChange, locale }: AnimationControlsProps) {
  const isAr = locale === 'ar';

  return (
    <div className="animation-controls">
      <button
        type="button"
        className={`control-btn ${settings.playing ? 'active' : ''}`}
        onClick={() => onChange({ ...settings, playing: !settings.playing })}
      >
        {settings.playing ? <Pause size={16} /> : <Play size={16} />}
        {settings.playing ? (isAr ? 'إيقاف' : 'Pause') : isAr ? 'تشغيل' : 'Play'}
      </button>

      <label className="control-slider">
        <Gauge size={16} />
        <span>{isAr ? 'السرعة' : 'Speed'}</span>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.5}
          value={settings.speed}
          onChange={(e) => onChange({ ...settings, speed: Number(e.target.value) })}
        />
        <code>{settings.speed}x</code>
      </label>

      <button
        type="button"
        className="control-btn"
        onClick={() => onChange({ ...settings, showMetrics: !settings.showMetrics })}
      >
        {settings.showMetrics ? <Eye size={16} /> : <EyeOff size={16} />}
        {isAr ? 'المقاييس' : 'Metrics'}
      </button>

      <button
        type="button"
        className="control-btn"
        onClick={() => onChange({ ...settings, showLabels: !settings.showLabels })}
      >
        {settings.showLabels ? <Eye size={16} /> : <EyeOff size={16} />}
        {isAr ? 'التسميات' : 'Labels'}
      </button>
    </div>
  );
}
