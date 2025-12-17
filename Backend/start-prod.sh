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

# Install goose to system location so it's always in PATH
if ! command -v goose &> /dev/null; then
    echo "📦 Installing goose migration tool..."
    
    # Try to install to system location first
    if [ -w /usr/local/bin ]; then
        go install github.com/pressly/goose/v3/cmd/goose@latest
        if [ -f "$(go env GOPATH)/bin/goose" ]; then
            cp "$(go env GOPATH)/bin/goose" /usr/local/bin/goose
            chmod +x /usr/local/bin/goose
            echo "✓ Goose installed to /usr/local/bin/goose"
        elif [ -f "$HOME/go/bin/goose" ]; then
            cp "$HOME/go/bin/goose" /usr/local/bin/goose
            chmod +x /usr/local/bin/goose
            echo "✓ Goose installed to /usr/local/bin/goose"
        fi
    else
        # Fallback: install to Go bin and add to PATH
        go install github.com/pressly/goose/v3/cmd/goose@latest
        export PATH="$PATH:$(go env GOPATH)/bin:$HOME/go/bin"
        echo "✓ Goose installed to Go bin directory"
    fi
fi

# Verify goose is accessible
if ! command -v goose &> /dev/null; then
    echo "❌ Error: goose is not accessible. Please install manually:"
    echo "   go install github.com/pressly/goose/v3/cmd/goose@latest"
    echo "   Then add $(go env GOPATH)/bin to your PATH"
    exit 1
fi

echo "✓ Goose is available: $(which goose)"

# Update dependencies
echo "📦 Updating dependencies..."
go mod tidy > /dev/null 2>&1

# Build application (skip optimizations for faster build on slow servers)
echo "🔨 Building application..."
go build -o main .
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Load environment variables
export ENV=production
export $(grep -v '^#' .env.production | grep -v '^$' | xargs)

# Ensure PATH includes Go bin and system bins for goose
export PATH="/usr/local/bin:/usr/local/go/bin:$(go env GOPATH)/bin:$HOME/go/bin:$PATH"

# Create logs directory if it doesn't exist
mkdir -p logs

# Run in background with full PATH preserved
echo "🚀 Starting server in background..."
nohup env PATH="$PATH" ./main > logs/app.log 2>&1 &
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



