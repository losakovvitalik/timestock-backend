#!/usr/bin/env bash
#
# backend-deploy.sh — автодеплой Strapi (Node 22 / pnpm / pm2)
# положите файл в корень репозитория и сделайте `chmod +x backend-deploy.sh`

set -euo pipefail

### ——— 0. где мы? ———
# абсолютный путь к каталогу скрипта
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# корень git-репозитория (на случай, если скрипт лежит в подпапке)
APP_DIR="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$SCRIPT_DIR")"

BRANCH="main"
APP_NAME="backend"
NODE_VERSION="22"

NVM_DIR="$HOME/.nvm"
PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

### ——— 1. Node / pnpm / pm2 ———
if [ ! -d "$NVM_DIR" ]; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi
# shellcheck source=/dev/null
source "$NVM_DIR/nvm.sh"
nvm install "$NODE_VERSION" -q
nvm use "$NODE_VERSION"    -q

command -v pnpm >/dev/null 2>&1 || npm i -g pnpm -s
command -v pm2  >/dev/null 2>&1 || pnpm add -g pm2

### ——— 2. Git pull ———
cd "$APP_DIR"
echo "🔄  Pulling $BRANCH in $APP_DIR ..."
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

### ——— 3. Deps & Build ———
pnpm install --frozen-lockfile
pnpm build          # Strapi v4

### ——— 4. PM2 ———
if pm2 list | grep -q "$APP_NAME"; then
  pm2 restart "$APP_NAME"
else
  pm2 start "pnpm start" --name "$APP_NAME"
fi

pm2 save
pm2 startup --silent

echo "✅  Deploy finished!"
