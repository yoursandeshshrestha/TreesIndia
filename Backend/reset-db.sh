#!/bin/bash

# PostgreSQL configuration from .env.local
DB_PORT=8090
DB_NAME=treesindia
DB_USER=postgres
DB_PASSWORD=sandesh@7866030737
CONTAINER_NAME=treesindia-postgres-local

echo "🔄 Resetting database..."

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ PostgreSQL container '$CONTAINER_NAME' is not running!"
    echo "Please start it first with: ./start-postgres.sh"
    exit 1
fi

# Drop and recreate the database
echo "📦 Dropping existing database..."
docker exec -e PGPASSWORD="$DB_PASSWORD" "$CONTAINER_NAME" \
    psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"

echo "📦 Creating new database..."
docker exec -e PGPASSWORD="$DB_PASSWORD" "$CONTAINER_NAME" \
    psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"

echo "✅ Database reset complete!"
echo ""
echo "The database will be migrated and seeded automatically when you restart the application."
