#!/usr/bin/env bash
# مراقبة تلقائية للخادم والنفق العام — يعيد التشغيل عند التوقف حتى 10:00 صباحاً (توقيت بغداد)

set -uo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT/backend"
LOG_DIR="/tmp/traffic-watchdog"
BACKEND_LOG="$LOG_DIR/backend.log"
TUNNEL_LOG="$LOG_DIR/cloudflared.log"
URL_FILE="$LOG_DIR/public-url.txt"
PID_BACKEND="$LOG_DIR/backend.pid"
PID_TUNNEL="$LOG_DIR/tunnel.pid"
CLOUDFLARED="${CLOUDFLARED_BIN:-/tmp/cloudflared}"
CHECK_INTERVAL=30
PORT=8000

mkdir -p "$LOG_DIR"

log() {
  echo "[$(TZ=Asia/Baghdad date '+%Y-%m-%d %H:%M:%S %Z')] $*"
}

deadline_epoch() {
  python3 << 'PY'
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
tz = ZoneInfo("Asia/Baghdad")
now = datetime.now(tz)
target = now.replace(hour=10, minute=0, second=0, microsecond=0)
if now >= target:
    target += timedelta(days=1)
print(int(target.timestamp()))
PY
}

is_before_deadline() {
  local now deadline
  now=$(date +%s)
  deadline=$(deadline_epoch)
  [[ "$now" -lt "$deadline" ]]
}

backend_healthy() {
  curl -sf --max-time 5 "http://127.0.0.1:${PORT}/" >/dev/null 2>&1
}

tunnel_pid_alive() {
  [[ -f "$PID_TUNNEL" ]] || return 1
  local pid
  pid=$(cat "$PID_TUNNEL" 2>/dev/null) || return 1
  kill -0 "$pid" 2>/dev/null
}

start_backend() {
  if backend_healthy; then
    return 0
  fi
  if [[ -f "$PID_BACKEND" ]]; then
    local old_pid
    old_pid=$(cat "$PID_BACKEND" 2>/dev/null || true)
    if [[ -n "$old_pid" ]] && kill -0 "$old_pid" 2>/dev/null; then
      kill "$old_pid" 2>/dev/null || true
      sleep 1
    fi
  fi
  log "تشغيل/إعادة تشغيل الخادم الخلفي..."
  cd "$BACKEND_DIR"
  nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT" >>"$BACKEND_LOG" 2>&1 &
  echo $! >"$PID_BACKEND"
  for _ in $(seq 1 20); do
    if backend_healthy; then
      log "الخادم الخلفي يعمل (PID $(cat "$PID_BACKEND"))"
      return 0
    fi
    sleep 1
  done
  log "تحذير: الخادم لم يستجب بعد إعادة التشغيل"
  return 1
}

start_tunnel() {
  if ! [[ -x "$CLOUDFLARED" ]]; then
    log "خطأ: cloudflared غير موجود في $CLOUDFLARED"
    return 1
  fi
  if tunnel_pid_alive; then
    return 0
  fi
  log "تشغيل/إعادة تشغيل النفق العام (cloudflared)..."
  nohup "$CLOUDFLARED" tunnel --url "http://127.0.0.1:${PORT}" >>"$TUNNEL_LOG" 2>&1 &
  echo $! >"$PID_TUNNEL"
  local url=""
  for _ in $(seq 1 30); do
    url=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG" 2>/dev/null | tail -1 || true)
    if [[ -n "$url" ]]; then
      echo "$url" >"$URL_FILE"
      log "الرابط العام: $url"
      return 0
    fi
    sleep 1
  done
  log "تحذير: لم يُستخرج رابط cloudflared بعد"
  return 1
}

check_public_url() {
  local url
  url=$(cat "$URL_FILE" 2>/dev/null || true)
  [[ -n "$url" ]] || return 1
  curl -sf --max-time 15 "$url/" >/dev/null 2>&1
}

stop_all() {
  log "إيقاف المراقبة والخدمات..."
  [[ -f "$PID_TUNNEL" ]] && kill "$(cat "$PID_TUNNEL")" 2>/dev/null || true
  [[ -f "$PID_BACKEND" ]] && kill "$(cat "$PID_BACKEND")" 2>/dev/null || true
  rm -f "$PID_TUNNEL" "$PID_BACKEND"
}

trap 'stop_all; exit 0' INT TERM

DEADLINE=$(deadline_epoch)
log "بدء المراقبة التلقائية — تستمر حتى $(TZ=Asia/Baghdad date -d "@$DEADLINE" '+%Y-%m-%d %H:%M %Z' 2>/dev/null || echo '10:00 صباحاً بغداد')"

start_backend
start_tunnel

while is_before_deadline; do
  if ! backend_healthy; then
    log "الخادم متوقف — إعادة التشغيل..."
    start_backend
  fi

  if ! tunnel_pid_alive || ! check_public_url; then
    log "النفق العام متوقف أو الرابط لا يستجيب — إعادة التشغيل..."
    [[ -f "$PID_TUNNEL" ]] && kill "$(cat "$PID_TUNNEL")" 2>/dev/null || true
    rm -f "$PID_TUNNEL" "$URL_FILE"
    : >"$TUNNEL_LOG"
    start_tunnel
  fi

  sleep "$CHECK_INTERVAL"
done

log "انتهى وقت المراقبة (10:00 صباحاً بتوقيت بغداد)"
stop_all
