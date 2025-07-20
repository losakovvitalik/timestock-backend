#!/usr/bin/env bash

# ─── Подгрузка nvm и pnpm ─────────────────────────────────────

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"

export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

# ─── Настройки ────────────────────────────────────────────────

APP_DIR="/root/backend"
BRANCH="main"
PM2_NAME="backend"

echo "🚀 Начинаем деплой Strapi..."

# ─── Переход в папку проекта ────────────────────────────────

cd "$APP_DIR" || { echo "❌ Папка $APP_DIR не найдена"; exit 1; }

# ─── Git: pull и жёсткий сброс ───────────────────────────────

echo "🔄 git pull..."
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

# ─── Установка зависимостей и сборка ─────────────────────────

echo "📦 Установка зависимостей..."
pnpm install

echo "🔧 Сборка Strapi..."
pnpm build

# ─── Перезапуск pm2 ──────────────────────────────────────────

if pm2 list | grep -q "$PM2_NAME"; then
  echo "🔁 Перезапуск PM2..."
  pm2 restart "$PM2_NAME"
else
  echo "🚀 Запуск PM2..."
  pm2 start pnpm --name "$PM2_NAME" -- start
fi

echo "✅ Деплой завершён!"