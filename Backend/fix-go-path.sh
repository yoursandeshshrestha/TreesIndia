#!/bin/bash

# Fix Go PATH and GOROOT issues
# Run this on your server

set -e

echo "🔧 Fixing Go environment..."

# Check current Go
echo "Current Go version:"
go version || echo "Go not found in PATH"

echo ""
echo "Current GOROOT:"
go env GOROOT 2>/dev/null || echo "Cannot determine GOROOT"

echo ""
echo "Current PATH:"
echo $PATH

# Remove old Go from PATH
export PATH=$(echo $PATH | tr ':' '\n' | grep -v '/usr/lib/go' | grep -v '/usr/lib/go-1.19' | tr '\n' ':' | sed 's/:$//')

# Add new Go to PATH (should be first)
export PATH="/usr/local/go/bin:$PATH"

# Unset GOROOT to let Go find itself
unset GOROOT

# Verify
echo ""
echo "✅ Updated environment:"
echo "Go version:"
/usr/local/go/bin/go version

echo ""
echo "New GOROOT:"
/usr/local/go/bin/go env GOROOT

echo ""
echo "📝 Add these to your ~/.bashrc or ~/.zshrc:"
echo ""
echo "export PATH=\"/usr/local/go/bin:\$PATH\""
echo "unset GOROOT"
echo ""
echo "Then run: source ~/.bashrc"
