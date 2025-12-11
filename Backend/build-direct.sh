#!/bin/bash

# Direct build script with progress output
# Run: bash build-direct.sh

set -e

echo "🔨 Building application (production mode)..."

# Update go.mod first
echo "Step 1/3: Updating go.mod..."
go mod tidy
echo "✓ Done"

# Build with verbose output
echo "Step 2/3: Building application (this may take 2-5 minutes)..."
echo "Progress:"
go build -v -ldflags="-w -s" -o main . 2>&1 | while IFS= read -r line; do
    echo "  $line"
done

if [ $? -eq 0 ]; then
    echo "✓ Build successful!"
    echo ""
    echo "Step 3/3: Binary created: ./main"
    ls -lh ./main
    echo ""
    echo "✅ Ready to run! Use: ./main"
else
    echo "❌ Build failed!"
    exit 1
fi
