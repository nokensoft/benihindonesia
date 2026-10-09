#!/usr/bin/env bash
# Pull the latest code, build the Astro site and publish dist/ to the
# CloudPanel document root. Run on the VPS as the site user:
#
#   bash ~/benihindonesia/deploy/deploy.sh
#
# Override the target with WEB_ROOT=/path bash deploy/deploy.sh if needed.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WEB_ROOT="${WEB_ROOT:-$HOME/htdocs/benihindonesia.org}"

# nvm is not loaded in non-interactive shells
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

cd "$REPO_DIR"

echo "==> Pulling latest code"
git pull --ff-only

echo "==> Installing dependencies"
npm ci

echo "==> Building site"
npm run build

echo "==> Publishing to $WEB_ROOT"
mkdir -p "$WEB_ROOT"
# .well-known holds Let's Encrypt challenges; never delete it
rsync -a --delete --exclude '.well-known' dist/ "$WEB_ROOT/"

echo "==> Done: $(git log -1 --format='%h %s')"
