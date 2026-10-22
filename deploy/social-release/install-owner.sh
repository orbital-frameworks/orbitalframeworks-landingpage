#!/usr/bin/env bash
set -euo pipefail

# Isolated deployment, intentionally outside Orbital's global control plane.
# Never run this installer through a Team session or as root.
if [[ "$(id -un)" != "orbital-private" ]]; then
  echo "OWNER_ONLY_INSTALL_REQUIRED" >&2; exit 2
fi
ROOT=/srv/orbital/workspaces/orbitalframeworks-landingpage
APP=/srv/orbital/runtimes/private/social-release
UNIT_DIR="$HOME/.config/systemd/user"
DEPS=/srv/orbital/workspaces/Content-Factory/node_modules
test -f "$ROOT/scripts/social-release-runner.mjs"
test -d "$DEPS/playwright" && test -d "$DEPS/playwright-core"
if [[ -f "$APP/.runner.lock" ]]; then echo "ACTIVE_OR_STALE_RELEASE_LOCK_REVIEW_REQUIRED" >&2; exit 2; fi
# One-owner timer only; pausing it prevents swapping modules mid-invocation.
if systemctl --user is-active --quiet orbital-social-release.timer; then
  systemctl --user stop orbital-social-release.timer
fi
umask 077
install -d -m 0700 "$APP" "$APP/bin" "$APP/src" "$APP/node_modules" "$APP/queue" "$APP/state" "$UNIT_DIR"
for file in social-release-core.mjs social-release-publisher.mjs social-release-runner.mjs blog-linkedin-gate.mjs; do
  install -m 0500 "$ROOT/scripts/$file" "$APP/bin/$file"
done
install -m 0400 "$ROOT/src/blogData.ts" "$APP/src/blogData.ts"
# Pin reviewed JS dependencies privately: the unattended owner session must
# not load executable JS from the shared Team-writable Content-Factory tree.
for pkg in playwright playwright-core; do
  # The Content-Factory tree has Team-writable setgid directories. Recursive
  # 'cp' can fail trying to propagate directory metadata into a 0700 runtime.
  # Materialize owner-only directories and files explicitly, no shared ACLs.
  while IFS= read -r -d '' dir; do
    rel="${dir#"$DEPS"/}"
    install -d -m 0700 "$APP/node_modules/$rel"
  done < <(find "$DEPS/$pkg" -type d -print0)
  while IFS= read -r -d '' file; do
    rel="${file#"$DEPS"/}"
    install -m 0600 "$file" "$APP/node_modules/$rel"
  done < <(find "$DEPS/$pkg" -type f -print0)
done
chmod -R go-rwx "$APP/node_modules"
find "$APP/node_modules" -type d -exec chmod u+rwx,go-rwx {} +
find "$APP/node_modules" -type f -exec chmod u+rw,go-rwx {} +
install -m 0600 "$ROOT/deploy/social-release/orbital-social-release.service" "$UNIT_DIR/orbital-social-release.service"
install -m 0600 "$ROOT/deploy/social-release/orbital-social-release.timer" "$UNIT_DIR/orbital-social-release.timer"
echo "PRIVATE_RUNTIME_DEPENDENCIES:"
node -p "require('$APP/node_modules/playwright/package.json').version"
sha256sum "$APP/bin/"*.mjs
systemctl --user daemon-reload
systemctl --user enable --now orbital-social-release.timer
echo "OWNER_SOCIAL_RELEASE_TIMER_ENABLED_EMPTY_QUEUE_SAFE"
