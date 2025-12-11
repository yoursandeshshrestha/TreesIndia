#!/bin/bash

# Script to install/upgrade Go on Linux server
# Run this on your server: bash install-go.sh

set -e

GO_VERSION="1.23.0"
INSTALL_DIR="/usr/local"

echo "🔧 Installing Go ${GO_VERSION}..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script needs root privileges. Run with sudo:"
    echo "   sudo bash install-go.sh"
    exit 1
fi

# Remove old Go installation if exists
if [ -d "${INSTALL_DIR}/go" ]; then
    echo "Removing old Go installation..."
    rm -rf "${INSTALL_DIR}/go"
fi

# Download and install Go
cd /tmp
ARCH="amd64"
OS="linux"

echo "Downloading Go ${GO_VERSION}..."
wget -q "https://go.dev/dl/go${GO_VERSION}.${OS}-${ARCH}.tar.gz" -O go.tar.gz

echo "Extracting..."
tar -C ${INSTALL_DIR} -xzf go.tar.gz
rm go.tar.gz

# Update PATH in profile
if ! grep -q "${INSTALL_DIR}/go/bin" /etc/profile; then
    echo "Updating PATH..."
    echo "export PATH=\$PATH:${INSTALL_DIR}/go/bin" >> /etc/profile
    export PATH=$PATH:${INSTALL_DIR}/go/bin
fi

# Verify installation
${INSTALL_DIR}/go/bin/go version

echo ""
echo "✅ Go ${GO_VERSION} installed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Reload your shell: source /etc/profile"
echo "   2. Or logout and login again"
echo "   3. Verify: go version"
echo "   4. Then run: cd /path/to/backend && make run-prod"
