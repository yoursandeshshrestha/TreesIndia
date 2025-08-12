#!/bin/bash

echo "🔧 Generating Swagger Documentation..."

# Check if swag is installed
if ! command -v swag &> /dev/null; then
    echo "Installing swag..."
    go install github.com/swaggo/swag/cmd/swag@latest
fi

# Generate swagger docs
swag init -g main.go -o ./docs

echo "✅ Swagger documentation generated successfully!"
echo "📖 Access the documentation at: http://localhost:8080/swagger/index.html"
