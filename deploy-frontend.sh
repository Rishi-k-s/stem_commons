#!/usr/bin/env bash
# Deploy the React frontend to the production server.
# Usage: ./deploy-frontend.sh
#
# One-time server setup (run once via SSH):
#   ssh -i ~/.ssh/AWS_ssh_key.pem ubuntu@13.204.236.176 \
#     "sudo chown -R ubuntu:ubuntu /var/www/stem-commons"

set -e  # exit immediately on any error

# ── Config ────────────────────────────────────────────────────────
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$ROOT/.env"
FRONTEND_DIR="$ROOT/frontend"
SERVER_KEY="$HOME/.ssh/AWS_ssh_key.pem"
SERVER="ubuntu@13.204.236.176"
REMOTE_DIR="/var/www/stem-commons"
PROD_URL="https://stem.rishikrishna.com"
# ─────────────────────────────────────────────────────────────────

echo "▶ STEM Commons — frontend deploy"

# Stash the current VITE_API_URL so we can restore it on exit
ORIGINAL_URL=$(grep "^VITE_API_URL=" "$ENV_FILE" | cut -d= -f2-)

revert_env() {
  sed -i.bak "s|VITE_API_URL=.*|VITE_API_URL=$ORIGINAL_URL|" "$ENV_FILE"
  rm -f "$ENV_FILE.bak"
  echo "↩  .env reverted to $ORIGINAL_URL"
}
trap revert_env EXIT  # runs on success AND failure

# 1. Switch to production API URL
sed -i.bak "s|VITE_API_URL=.*|VITE_API_URL=/api/v1|" "$ENV_FILE"
rm -f "$ENV_FILE.bak"
echo "✓  VITE_API_URL=/api/v1"

# 2. Build
echo "📦 Building..."
cd "$FRONTEND_DIR"
npm run build
echo "✓  Build complete (dist/)"

# 3. Upload — rsync only sends changed files
echo "📤 Uploading to $SERVER..."
rsync -az --delete \
  -e "ssh -i $SERVER_KEY" \
  dist/ \
  "$SERVER:$REMOTE_DIR/"

echo ""
echo "✅ Deployed → $PROD_URL"
