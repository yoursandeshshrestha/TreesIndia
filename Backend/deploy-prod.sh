#!/bin/bash

# Production Deployment Script for TREESINDIA Backend
set -e

echo "🚀 Starting production deployment..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create .env.production with production settings"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Remove old images
echo "🧹 Cleaning up old images..."
docker image prune -f

# Build and start production containers
echo "🔨 Building and starting production containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for container to be healthy
echo "⏳ Waiting for container to be healthy..."
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if docker-compose -f docker-compose.prod.yml ps | grep -q "healthy"; then
        echo "✅ Container is healthy!"
        break
    fi
    echo "⏳ Waiting... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 2))
done

if [ $counter -eq $timeout ]; then
    echo "❌ Container failed to become healthy within $timeout seconds"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# Test the API
echo "🧪 Testing API endpoint..."
if curl -f http://localhost:8080/ > /dev/null 2>&1; then
    echo "✅ API is responding correctly!"
else
    echo "❌ API is not responding correctly"
    exit 1
fi

echo "🎉 Production deployment completed successfully!"
echo "📊 API is running at: http://localhost:8080"
echo "📚 Swagger docs: http://localhost:8080/swagger/index.html"
