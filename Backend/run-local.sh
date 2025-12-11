#!/bin/bash

# Local build and run script for backend (no Docker)
# Usage: ./run-local.sh [production|dev]

set -e

# Determine mode (default to production if .env.production exists, otherwise dev)
MODE="${1:-auto}"

if [ "$MODE" = "auto" ]; then
    if [ -f .env.production ]; then
        MODE="production"
    else
        MODE="dev"
    fi
fi

if [ "$MODE" = "production" ]; then
    echo "🚀 Building and running TREESINDIA backend in PRODUCTION mode..."
    ENV_FILE=".env.production"
    BUILD_FLAGS="-ldflags='-w -s'"
    ENV_VAR="ENV=production"
else
    echo "🚀 Building and running TREESINDIA backend in DEVELOPMENT mode..."
    ENV_FILE=".env"
    BUILD_FLAGS=""
    ENV_VAR="ENV=development"
fi

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Error: Go is not installed. Please install Go 1.23.0 or later."
    echo "   Visit: https://golang.org/dl/"
    exit 1
fi

# Check Go version
GO_VERSION=$(go version | awk '{print $3}' | sed 's/go//')
echo "✓ Go version: $GO_VERSION"

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    if [ "$MODE" = "production" ]; then
        echo "❌ Error: .env.production file not found!"
        echo "   Please create .env.production with production configuration."
        exit 1
    else
        echo "⚠️  Warning: .env file not found. Creating from .env.production if available..."
        if [ -f .env.production ]; then
            cp .env.production .env
            echo "✓ Created .env from .env.production (please review and update as needed)"
        else
            echo "⚠️  No .env file found. The app will use default values or environment variables."
        fi
    fi
else
    echo "✓ Using $ENV_FILE"
fi

# Install/update dependencies
echo "📦 Downloading Go dependencies..."
go mod download
go mod tidy

# Install goose if not already installed
if ! command -v goose &> /dev/null; then
    echo "📦 Installing goose migration tool..."
    go install github.com/pressly/goose/v3/cmd/goose@latest
    echo "✓ Goose installed"
else
    echo "✓ Goose already installed"
fi

# Build the application
echo "🔨 Building application ($MODE mode)..."
if [ "$MODE" = "production" ]; then
    # Production build with optimizations (for current platform)
    go build -ldflags="-w -s" -o main .
else
    # Development build
    go build -o main .
fi

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Starting server in $MODE mode..."
    echo "   Press Ctrl+C to stop"
    echo ""
    # Set environment and run
    export $ENV_VAR
    if [ -f "$ENV_FILE" ]; then
        # Load env file variables
        export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)
    fi
    ./main
else
    echo "❌ Build failed!"
    exit 1
fi
