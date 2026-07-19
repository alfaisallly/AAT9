#!/usr/bin/env bash
# AstroLab — keep public tunnel alive until deadline
# Eng. Ahmed alfaisal

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="/tmp/astrolab-keepalive.log"
URL_FILE="/tmp/astrolab-public-url.txt"
DEADLINE="${ASTROLAB_DEADLINE:-2026-07-20T07:00:00Z}"  # 10:00 AM Iraq (UTC+3)
CLOUDFLARED="${CLOUDFLARED:-/tmp/cloudflared}"
PORT=3000

log() { echo "[$(date -Iseconds)] $*" | tee -a "$LOG"; }

deadline_ts() { date -d "$DEADLINE" +%s 2>/dev/null || date -d "2026-07-20 07:00:00 UTC" +%s; }

wait_for_dev() {
  for i in $(seq 1 30); do
    if curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PORT}/login" 2>/dev/null | grep -q 200; then
      return 0
    fi
    sleep 2
  done
  return 1
}

start_dev() {
  if wait_for_dev; then
    log "Dev server already up on :${PORT}"
    return
  fi
  log "Starting dev server..."
  tmux -f /exec-daemon/tmux.portal.conf kill-session -t astro-dev-server 2>/dev/null || true
  tmux -f /exec-daemon/tmux.portal.conf new-session -d -s astro-dev-server -c "$ROOT" -- \
    "${SHELL:-bash}" -lc "npm run dev 2>&1 | tee /tmp/astro-dev.log"
  wait_for_dev || { log "ERROR: dev server failed"; exit 1; }
  log "Dev server ready"
}

get_tunnel_url() {
  rg -o "https://[a-z0-9-]+\.trycloudflare\.com" /tmp/cloudflared.log 2>/dev/null | tail -1
}

test_tunnel() {
  local url="$1"
  [ -n "$url" ] || return 1
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "${url}/login" 2>/dev/null || echo "000")
  [ "$code" = "200" ]
}

start_cloudflared() {
  log "Starting cloudflared tunnel..."
  tmux -f /exec-daemon/tmux.portal.conf kill-session -t cloudflared-tunnel 2>/dev/null || true
  : > /tmp/cloudflared.log
  tmux -f /exec-daemon/tmux.portal.conf new-session -d -s cloudflared-tunnel -c "$ROOT" -- \
    "${SHELL:-bash}" -lc "\"$CLOUDFLARED\" tunnel --url http://127.0.0.1:${PORT} 2>&1 | tee -a /tmp/cloudflared.log"

  for i in $(seq 1 20); do
    sleep 2
    local url
    url=$(get_tunnel_url)
    if [ -n "$url" ] && test_tunnel "$url"; then
      echo "$url" > "$URL_FILE"
      log "Tunnel live: $url"
      return 0
    fi
  done
  log "WARN: tunnel not ready yet"
  return 1
}

publish_url() {
  local url="$1"
  echo "$url" > "$URL_FILE"
  cat > /tmp/astrolab-share.txt <<EOF
AstroLab — Eng. Ahmed alfaisal
URL: $url
Login user: astro
Password: Astro2026
Owner: ahmed.alfaisal / AstroLab2026
Valid until: $DEADLINE (10 AM Iraq time)
EOF
}

END=$(deadline_ts)
log "Keepalive until: $DEADLINE (ts=$END)"

start_dev

while [ "$(date +%s)" -lt "$END" ]; do
  URL=$(get_tunnel_url)
  if [ -z "$URL" ] || ! test_tunnel "$URL"; then
    log "Tunnel down — restarting cloudflared..."
    start_cloudflared || true
    URL=$(get_tunnel_url)
  fi

  if [ -n "$URL" ] && test_tunnel "$URL"; then
    publish_url "$URL"
    log "OK $URL ($(curl -s -o /dev/null -w '%{http_code}' "${URL}/login" --max-time 10))"
  else
    log "Waiting for healthy tunnel..."
  fi

  if ! wait_for_dev; then
    log "Dev down — restarting..."
    start_dev
  fi

  sleep 45
done

log "Deadline reached — stopping keepalive"
tmux -f /exec-daemon/tmux.portal.conf kill-session -t cloudflared-tunnel 2>/dev/null || true
