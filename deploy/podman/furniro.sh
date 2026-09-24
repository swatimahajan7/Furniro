#!/usr/bin/env bash
# Run Furniro on a VM with Podman (3.x or 4.x), as one pod: PostgreSQL + API + nginx-served SPA.
#
# Why a pod and not podman-compose: podman-compose on Podman 3.x gives containers no service-name
# DNS, which the stack needs. In a pod the containers share localhost, and `db`/`backend` are
# mapped to 127.0.0.1, so the images run unchanged. Only WEB_PORT and API_PORT are published.
#
# Usage: ./furniro.sh <command>      (see `./furniro.sh help`; guide: deploy/README.md)
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
ENV_FILE="$HERE/furniro.env"
RUNTIME_ENV="$HERE/.runtime.env"

die() { echo "error: $*" >&2; exit 1; }
say() { echo "==> $*"; }
# Podman 3.x prints harmless CNI warnings on every call; show errors only.
pm() { podman --log-level=error "$@"; }

random_secret() { LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c "$1"; }

load_env() {
  [[ -f "$ENV_FILE" ]] || die "no $ENV_FILE yet: run './furniro.sh init' first"
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
  : "${NAME:=furniro}" "${WEB_PORT:=5180}" "${API_PORT:=8100}" "${PUBLIC_URL:=http://localhost:$WEB_PORT}"
  [[ -n "${POSTGRES_PASSWORD:-}" && -n "${JWT_SECRET:-}" ]] || die "POSTGRES_PASSWORD and JWT_SECRET must be set in $ENV_FILE"
  (( ${#JWT_SECRET} >= 32 )) || die "JWT_SECRET must be at least 32 characters"
  [[ "$POSTGRES_PASSWORD" =~ ^[A-Za-z0-9]+$ ]] || die "POSTGRES_PASSWORD: use letters and digits only"
  POD="$NAME"; DB="$NAME-db"; API="$NAME-backend"; WEB="$NAME-frontend"
  VOLUME="$NAME-db-data"
  IMG_API="localhost/$NAME-backend:latest"; IMG_WEB="localhost/$NAME-frontend:latest"
}

# Settings every container reads, rewritten on every start from furniro.env. Passing them as an
# --env-file keeps the secrets out of the generated systemd units; they are still visible in
# `podman inspect`, but only to the VM user who runs the pod (and who owns furniro.env anyway).
write_runtime_env() {
  umask 077
  cat >"$RUNTIME_ENV" <<EOF
POSTGRES_USER=furniro
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=furniro
APP_ENV=prod
DATABASE_URL=postgresql+psycopg://furniro:$POSTGRES_PASSWORD@db:5432/furniro
JWT_SECRET=$JWT_SECRET
CORS_ORIGINS=$PUBLIC_URL
SEED_ON_STARTUP=true
EOF
}

wait_for() { # <description> <seconds> <command...>
  local what="$1" secs="$2"; shift 2
  for ((i = 0; i < secs; i++)); do "$@" >/dev/null 2>&1 && return 0; sleep 1; done
  die "$what did not become ready within ${secs}s (try './furniro.sh logs')"
}

api_healthy() {
  pm exec "$API" python -c "import urllib.request,sys; sys.exit(urllib.request.urlopen('http://127.0.0.1:8000/api/v1/health').status != 200)"
}

# After `autostart`, systemd owns the pod; up/down/restart then go through systemctl.
systemctl_scope() { if [[ $EUID -eq 0 ]]; then echo --system; else echo --user; fi; }
autostart_enabled() {
  command -v systemctl >/dev/null && systemctl "$(systemctl_scope)" is-enabled "pod-$POD.service" >/dev/null 2>&1
}

cmd_init() {
  if [[ -f "$ENV_FILE" ]]; then
    say "$ENV_FILE already exists; leaving it alone"
  else
    cp "$HERE/furniro.env.example" "$ENV_FILE"
    say "created $ENV_FILE"
  fi
  # Fill in empty secrets only; never overwrite existing ones (that would lock out the database).
  if grep -q '^POSTGRES_PASSWORD=$' "$ENV_FILE"; then sed -i "s/^POSTGRES_PASSWORD=$/POSTGRES_PASSWORD=$(random_secret 32)/" "$ENV_FILE"; fi
  if grep -q '^JWT_SECRET=$' "$ENV_FILE"; then sed -i "s/^JWT_SECRET=$/JWT_SECRET=$(random_secret 48)/" "$ENV_FILE"; fi
  chmod 600 "$ENV_FILE"
  say "now set PUBLIC_URL in $ENV_FILE to http://<this VM's address>:<WEB_PORT>"
}

cmd_build() {
  load_env
  # --format docker keeps the images' HEALTHCHECK (the default OCI format drops it).
  say "building $IMG_API"; pm build --format docker -t "$IMG_API" "$ROOT/backend"
  say "building $IMG_WEB"; pm build --format docker -t "$IMG_WEB" "$ROOT/frontend"
}

cmd_up() {
  load_env
  if autostart_enabled; then
    write_runtime_env
    say "starting via systemd (pod-$POD.service)"
    systemctl "$(systemctl_scope)" start "pod-$POD.service"
    wait_for "the API" 120 api_healthy
    say "Furniro is up: $PUBLIC_URL"
    return
  fi
  if pm pod exists "$POD"; then
    say "pod $POD already exists; use './furniro.sh restart' to recreate it"; cmd_status; return
  fi
  pm image exists "$IMG_API" && pm image exists "$IMG_WEB" || die "images not built yet: run './furniro.sh build'"
  write_runtime_env
  pm volume exists "$VOLUME" || pm volume create "$VOLUME" >/dev/null

  say "starting pod $POD (web :$WEB_PORT, api :$API_PORT)"
  pm pod create --name "$POD" -p "$WEB_PORT:80" -p "$API_PORT:8000" \
    --add-host db:127.0.0.1 --add-host backend:127.0.0.1 >/dev/null
  pm run -d --pod "$POD" --name "$DB" --env-file "$RUNTIME_ENV" \
    -v "$VOLUME:/var/lib/postgresql/data" docker.io/library/postgres:16-alpine >/dev/null
  wait_for "PostgreSQL" 60 pm exec "$DB" pg_isready -U furniro -d furniro
  pm run -d --pod "$POD" --name "$API" --env-file "$RUNTIME_ENV" "$IMG_API" >/dev/null
  wait_for "the API (migrations + seed)" 120 api_healthy
  pm run -d --pod "$POD" --name "$WEB" "$IMG_WEB" >/dev/null
  wait_for "the web server" 30 pm exec "$WEB" wget -q -O /dev/null http://127.0.0.1/
  say "Furniro is up:"
  echo "    site:     $PUBLIC_URL"
  local host="${PUBLIC_URL%/}"
  [[ "$host" =~ :[0-9]+$ ]] && host="${host%:*}"
  echo "    API docs: $host:$API_PORT/docs   (also at ${PUBLIC_URL%/}/docs)"
}

cmd_down() {
  load_env
  if autostart_enabled; then
    say "stopping via systemd (pod-$POD.service; it will start again on boot)"
    systemctl "$(systemctl_scope)" stop "pod-$POD.service"
    return
  fi
  if pm pod exists "$POD"; then
    say "stopping and removing pod $POD (the database volume $VOLUME is kept)"
    pm pod stop -t 20 "$POD" >/dev/null && pm pod rm "$POD" >/dev/null
  else
    say "pod $POD is not running"
  fi
}

cmd_status() {
  load_env
  pm pod ps --filter "name=^$POD\$"
  pm ps -a --pod --filter "pod=$POD" --format '{{.Names}}\t{{.Status}}'
  if pm pod exists "$POD" && api_healthy; then say "API healthy"; else say "API not healthy (see './furniro.sh logs backend')"; fi
}

cmd_logs() {
  load_env
  local target="${1:-backend}"
  case "$target" in db | backend | frontend) pm logs -f --tail 200 "$NAME-$target" ;; *) die "logs: db | backend | frontend" ;; esac
}

cmd_update() {
  load_env
  say "pulling the latest code"; git -C "$ROOT" pull --ff-only
  cmd_build
  cmd_down
  cmd_up   # the API applies new migrations on startup; data in $VOLUME is kept
}

cmd_backup() {
  load_env
  mkdir -p "$HERE/backups"
  local file="$HERE/backups/$NAME-$(date +%Y%m%d-%H%M%S).sql.gz"
  (umask 077; pm exec "$DB" pg_dump -U furniro furniro | gzip >"$file")  # customer data: owner-only
  say "backup written to $file"
}

cmd_autostart() {
  load_env
  pm pod exists "$POD" || die "start the pod first ('./furniro.sh up'), then run autostart"
  local dir
  if [[ $EUID -eq 0 ]]; then dir=/etc/systemd/system; else dir="$HOME/.config/systemd/user"; fi
  mkdir -p "$dir"
  # --new: on boot systemd recreates the pod and containers from their create commands
  # (Restart=on-failure covers the API starting before PostgreSQL is ready).
  (cd "$dir" && pm generate systemd --new --files --name "$POD" >/dev/null)
  cmd_down
  systemctl "$(systemctl_scope)" daemon-reload
  systemctl "$(systemctl_scope)" enable --now "pod-$POD.service"
  if [[ $EUID -ne 0 ]]; then
    loginctl enable-linger "$USER" || say "could not enable lingering; ask an admin to run: loginctl enable-linger $USER"
  fi
  say "Furniro now starts on boot (unit pod-$POD.service in $dir)"
  say "ports and names are baked into the units: after changing WEB_PORT, API_PORT or NAME, run"
  say "'./furniro.sh autostart-off', then 'up' and 'autostart' again"
}

cmd_autostart_off() {
  load_env
  local dir
  if [[ $EUID -eq 0 ]]; then dir=/etc/systemd/system; else dir="$HOME/.config/systemd/user"; fi
  systemctl "$(systemctl_scope)" disable --now "pod-$POD.service" 2>/dev/null || true
  rm -f "$dir/pod-$POD.service" "$dir"/container-"$NAME"-{db,backend,frontend}.service
  systemctl "$(systemctl_scope)" daemon-reload
  say "autostart removed; the pod is stopped (start it with './furniro.sh up')"
}

cmd_help() {
  cat <<'EOF'
Usage: ./furniro.sh <command>

  init        create furniro.env (from the example) and generate its secrets
  build       build the backend and frontend images from this checkout
  up          start the pod: PostgreSQL, API, web (waits until each is ready)
  down        stop and remove the pod (the database volume is kept)
  restart     down + up
  status      show the pod, its containers and API health
  logs [svc]  follow the logs of db | backend | frontend (default backend)
  update      git pull, rebuild, recreate (migrations run automatically)
  backup      pg_dump the database into deploy/podman/backups/
  autostart   start on boot via systemd (run after 'up'); up/down/restart then use systemd
  autostart-off  remove the systemd units again
EOF
}

command -v podman >/dev/null || die "podman is not installed"
case "${1:-help}" in
  init) cmd_init ;;
  build) cmd_build ;;
  up) cmd_up ;;
  down) cmd_down ;;
  restart) cmd_down; cmd_up ;;
  status) cmd_status ;;
  logs) cmd_logs "${2:-}" ;;
  update) cmd_update ;;
  backup) cmd_backup ;;
  autostart) cmd_autostart ;;
  autostart-off) cmd_autostart_off ;;
  help | -h | --help) cmd_help ;;
  *) cmd_help; exit 1 ;;
esac
