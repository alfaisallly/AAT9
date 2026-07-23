#!/usr/bin/env bash
# تشغيل المراقبة التلقائية في tmux — يعيد تشغيل الخادم والنفق حتى 10:00 صباحاً (بغداد)

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
SESSION="traffic-watchdog"
TMUX_CONF="/exec-daemon/tmux.portal.conf"

chmod +x "$ROOT/watchdog.sh"

tmux -f "$TMUX_CONF" kill-session -t "$SESSION" 2>/dev/null || true
tmux -f "$TMUX_CONF" new-session -d -s "$SESSION" -c "$ROOT" -- bash -l -c "$ROOT/watchdog.sh"

echo "انتظر 15 ثانية لتهيئة الرابط..."
sleep 15

echo ""
echo "=== الرابط التجريبي ==="
if [[ -f /tmp/traffic-watchdog/public-url.txt ]]; then
  cat /tmp/traffic-watchdog/public-url.txt
else
  echo "(جاري التهيئة — راجع: /tmp/traffic-watchdog/public-url.txt)"
fi
echo ""
echo "المراقبة: tmux session «traffic-watchdog»"
echo "السجلات: /tmp/traffic-watchdog/"
echo "يعاد التشغيل تلقائياً عند التوقف حتى 10:00 صباحاً بتوقيت بغداد"
