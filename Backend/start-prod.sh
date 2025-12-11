#!/bin/bash

# Production startup script - builds and runs in background
# Usage: ./start-prod.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting TREESINDIA backend in production mode..."

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Error: Go is not installed."
    exit 1
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    exit 1
fi

# Check if already running
if pgrep -f "./main" > /dev/null; then
    echo "⚠️  Backend is already running. Stopping it first..."
    pkill -f "./main"
    sleep 2
fi

# Install goose if needed
if ! command -v goose &> /dev/null; then
    echo "📦 Installing goose migration tool..."
    go install github.com/pressly/goose/v3/cmd/goose@latest > /dev/null 2>&1
fi

# Update dependencies
echo "📦 Updating dependencies..."
go mod tidy > /dev/null 2>&1

# Build application
echo "🔨 Building application..."
if go build -ldflags="-w -s" -o main . 2>/dev/null; then
    echo "✅ Build successful!"
else
    echo "⚠️  Build with optimizations failed, trying without..."
    go build -o main .
    echo "✅ Build successful!"
fi

# Load environment variables
export ENV=production
export $(grep -v '^#' .env.production | grep -v '^$' | xargs)

# Create logs directory if it doesn't exist
mkdir -p logs

# Run in background
echo "🚀 Starting server in background..."
nohup ./main > logs/app.log 2>&1 &
PID=$!

# Wait a moment to check if it started
sleep 3

if ps -p $PID > /dev/null; then
    echo "✅ Backend started successfully!"
    echo "   PID: $PID"
    echo "   Logs: logs/app.log"
    echo "   Port: ${PORT:-8080}"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs: tail -f logs/app.log"
    echo "   Stop: pkill -f './main'"
    echo "   Status: ps aux | grep './main'"
else
    echo "❌ Backend failed to start. Check logs/app.log for errors."
    exit 1
fi
