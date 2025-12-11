#!/bin/bash
# Optimized build script with BuildKit enabled

# Enable BuildKit for faster builds
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Build with optimized settings
docker-compose -f docker-compose.prod.yml build --parallel

# Start services
docker-compose -f docker-compose.prod.yml up -d
