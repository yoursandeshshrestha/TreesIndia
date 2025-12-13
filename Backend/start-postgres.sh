#!/bin/bash

# PostgreSQL configuration from .env.local
DB_PORT=8090
DB_NAME=treesindia
DB_USER=postgres
DB_PASSWORD=sandesh@7866030737

# Stop and remove existing container if it exists
docker stop treesindia-postgres-local 2>/dev/null || true
docker rm treesindia-postgres-local 2>/dev/null || true

# Start PostgreSQL container
docker run -d \
  --name treesindia-postgres-local \
  -e POSTGRES_USER="${DB_USER}" \
  -e POSTGRES_PASSWORD="${DB_PASSWORD}" \
  -e POSTGRES_DB="${DB_NAME}" \
  -p "${DB_PORT}:5432" \
  -v treesindia_postgres_local_data:/var/lib/postgresql/data \
  --restart unless-stopped \
  postgres:15-alpine

echo "PostgreSQL container started!"
echo "Connection details:"
echo "  Host: localhost"
echo "  Port: ${DB_PORT}"
echo "  Database: ${DB_NAME}"
echo "  User: ${DB_USER}"
echo ""
echo "To view logs: docker logs -f treesindia-postgres-local"
echo "To stop: docker stop treesindia-postgres-local"
echo "To remove: docker rm -f treesindia-postgres-local"
