#!/bin/bash
# AgriPulse AI — start both servers

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "🌾 Starting AgriPulse AI..."
echo ""

# Backend
echo "▶ Backend  → http://localhost:8000"
cd "$ROOT/backend"
[ ! -f .env ] && cp .env.example .env
PATH="$PATH:/Users/milly/Library/Python/3.9/bin" python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

sleep 2

# Frontend
echo "▶ Frontend → http://localhost:3000"
cd "$ROOT/frontend"
PORT=3000 npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers running"
echo "   Frontend : http://localhost:3000"
echo "   Backend  : http://localhost:8000"
echo "   API Docs : http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" INT TERM
wait
