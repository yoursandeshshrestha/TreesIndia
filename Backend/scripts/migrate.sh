#!/bin/bash

# Migration script for TREESINDIA backend
# Usage: ./scripts/migrate.sh [option]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Go is installed
if ! command -v go &> /dev/null; then
    print_error "Go is not installed. Please install Go 1.21+ first."
    exit 1
fi

# Change to backend directory
cd "$(dirname "$0")/.."

# Default action
if [ $# -eq 0 ]; then
    print_status "Running migrations..."
    go run cmd/migrate/main.go
    exit 0
fi

# Handle different options
case "$1" in
    "dry-run"|"--dry-run"|"-d")
        print_status "Running migrations in dry-run mode..."
        go run cmd/migrate/main.go --dry-run
        ;;
    "help"|"--help"|"-h")
        echo "TREESINDIA Migration Script"
        echo ""
        echo "Usage: ./scripts/migrate.sh [option]"
        echo ""
        echo "Options:"
        echo "  (no args)    Run all pending migrations"
        echo "  dry-run      Show what migrations would be run without executing"
        echo "  help         Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./scripts/migrate.sh              # Run migrations"
        echo "  ./scripts/migrate.sh dry-run      # Show pending migrations"
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use './scripts/migrate.sh help' for usage information"
        exit 1
        ;;
esac
