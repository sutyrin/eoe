#!/bin/bash
set -euo pipefail

REMOTE="root@fra"
REMOTE_DIR="/opt/eoe-portfolio"

echo "==> Syncing code to $REMOTE:$REMOTE_DIR..."
rsync -az --delete \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  --exclude=videos \
  --exclude=games \
  --exclude=devvit \
  --exclude=.vercel \
  --exclude=.planning \
  --exclude='.env' \
  -e ssh \
  ./ "$REMOTE:$REMOTE_DIR/"

echo "==> Building and starting container on remote..."
ssh "$REMOTE" "cd $REMOTE_DIR/portfolio && docker compose down --remove-orphans 2>/dev/null; docker compose up -d --build"

echo "==> Waiting for container health..."
ssh "$REMOTE" "sleep 3 && docker ps --filter name=eoe-portfolio --format '{{.Status}}'"

echo "==> Testing local response..."
ssh "$REMOTE" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3080/"

echo ""
echo "Deploy complete! Site should be at https://llm.sutyrin.pro"
