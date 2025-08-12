#!/bin/bash

# Build script for TREESINDIA backend
# Usage: ./build.sh [option]

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

# Get Go version
GO_VERSION=$(go version | awk '{print $3}' | sed 's/go//')
print_status "Using Go version: $GO_VERSION"

# Default build
build_default() {
    print_status "Building for current platform..."
    go build -o main .
    print_status "Build completed! Binary: ./main"
}

# Optimized build
build_optimized() {
    print_status "Building optimized binary..."
    go build -ldflags="-s -w" -o main .
    print_status "Optimized build completed! Binary: ./main"
}

# Cross-platform builds
build_cross() {
    print_status "Building for multiple platforms..."
    
    # Linux
    print_status "Building for Linux..."
    GOOS=linux GOARCH=amd64 go build -o main-linux .
    
    # Windows
    print_status "Building for Windows..."
    GOOS=windows GOARCH=amd64 go build -o main.exe .
    
    # macOS Intel
    print_status "Building for macOS (Intel)..."
    GOOS=darwin GOARCH=amd64 go build -o main-darwin .
    
    # macOS Apple Silicon
    print_status "Building for macOS (Apple Silicon)..."
    GOOS=darwin GOARCH=arm64 go build -o main-darwin-arm64 .
    
    print_status "Cross-platform builds completed!"
    ls -la main*
}



# Clean build artifacts
clean() {
    print_status "Cleaning build artifacts..."
    rm -f main main.exe main-*
    print_status "Clean completed!"
}

# Show help
show_help() {
    echo "TREESINDIA Backend Build Script"
    echo ""
    echo "Usage: ./build.sh [option]"
    echo ""
    echo "Options:"
    echo "  default     Build for current platform (default)"
    echo "  optimized   Build optimized binary (smaller size)"
    echo "  cross       Build for multiple platforms"
    
    echo "  clean       Clean build artifacts"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./build.sh              # Default build"
    echo "  ./build.sh optimized    # Optimized build"
    echo "  ./build.sh cross        # Cross-platform builds"
    
}

# Main script logic
case "${1:-default}" in
    "default")
        build_default
        ;;
    "optimized")
        build_optimized
        ;;
    "cross")
        build_cross
        ;;

    "clean")
        clean
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
