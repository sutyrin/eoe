#!/bin/bash
set -euo pipefail

DEPLOY_HOST="${DEPLOY_HOST:-fra}"
DEPLOY_USER="${DEPLOY_USER:-root}"
REMOTE="${DEPLOY_USER}@${DEPLOY_HOST}"
REMOTE_DIR="${DEPLOY_DIR:-/opt/eoe-portfolio}"
SSH_OPTS="${SSH_OPTS:-}"

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
  -e "ssh ${SSH_OPTS}" \
  ./ "$REMOTE:$REMOTE_DIR/"

echo "==> Building and starting containers on remote..."
ssh $SSH_OPTS "$REMOTE" "cd $REMOTE_DIR/portfolio && docker compose down --remove-orphans 2>/dev/null; docker compose up -d --build"

echo "==> Waiting for containers health..."
ssh $SSH_OPTS "$REMOTE" "sleep 5 && docker ps --filter name=eoe --format '{{.Names}}: {{.Status}}'"

echo "==> Testing portfolio response..."
ssh $SSH_OPTS "$REMOTE" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3080/"

echo "==> Testing backup server..."
ssh $SSH_OPTS "$REMOTE" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3081/api/health"

echo ""
echo "Deploy complete! Site should be at https://llm.sutyrin.pro"
