#!/bin/bash

# Stop production backend
# Usage: ./stop-prod.sh

echo "🛑 Stopping TREESINDIA backend..."

if pgrep -f "./main" > /dev/null; then
    pkill -f "./main"
    sleep 2
    
    if pgrep -f "./main" > /dev/null; then
        echo "⚠️  Process still running, force killing..."
        pkill -9 -f "./main"
    fi
    
    echo "✅ Backend stopped"
else
    echo "ℹ️  Backend is not running"
fi
