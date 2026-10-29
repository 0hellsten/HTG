#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "Startar Stallbacken..."

if [ ! -d "node_modules" ]; then
  echo "Förbereder första körningen..."
  pnpm install
fi

# Öppna webbläsare i bakgrunden om möjligt
if command -v xdg-open > /dev/null; then
  (sleep 2 && xdg-open http://localhost:5173) &
elif command -v open > /dev/null; then
  (sleep 2 && open http://localhost:5173) &
fi

pnpm dev
