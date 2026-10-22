#!/usr/bin/env bash
set -euo pipefail
if [[ "$(id -un)" != "orbital-private" ]]; then
  echo 'B2B05_OWNER_ONLY_INSTALL_REQUIRED' >&2;exit 2
fi
ROOT=/srv/orbital/workspaces/orbitalframeworks-landingpage
OWNER=/srv/orbital/runtimes/private/social-release
UNIT_DIR="$HOME/.config/systemd/user"
test -r "$ROOT/docs/social/b2b05/v3/PUBLICATION_APPROVAL_20261022.md"
test -r "$ROOT/scripts/release-b2b05-article.mjs"
test -e "$ROOT/docs/social/b2b05/v3/orbital-b2b05-carousel-v3.pdf"
umask 077
install -d -m 0700 "$OWNER/bin" "$UNIT_DIR"
if systemctl --user is-active --quiet orbital-b2b05-blog-release.service; then
  echo 'B2B05_RELEASE_CURRENTLY_RUNNING_STOP_INSTALL' >&2;exit 2
fi
install -m 0500 "$ROOT/scripts/release-b2b05-article.mjs" "$OWNER/bin/release-b2b05-article.mjs"
install -m 0600 "$ROOT/deploy/b2b05/orbital-b2b05-blog-release.service" "$UNIT_DIR/orbital-b2b05-blog-release.service"
install -m 0600 "$ROOT/deploy/b2b05/orbital-b2b05-blog-release.timer" "$UNIT_DIR/orbital-b2b05-blog-release.timer"
systemctl --user daemon-reload
systemctl --user enable --now orbital-b2b05-blog-release.timer
echo 'B2B05_ARTICLE_TIMER_INSTALLED'
