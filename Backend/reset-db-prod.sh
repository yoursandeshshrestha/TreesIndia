#!/bin/bash

# Production Database Reset Script
# WARNING: This script will DROP and RECREATE the production database!
# All data will be permanently lost unless backed up first.

set -e  # Exit on error

# Production PostgreSQL configuration
CONTAINER_NAME=treesindia-postgres-prod
DB_NAME=${DB_NAME:-treesindia}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-""}

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${RED}⚠️  WARNING: PRODUCTION DATABASE RESET ⚠️${NC}"
echo ""
echo "This script will:"
echo "  1. DROP the existing database: ${DB_NAME}"
echo "  2. CREATE a new empty database: ${DB_NAME}"
echo "  3. All data will be PERMANENTLY LOST!"
echo ""
echo -e "${YELLOW}Container: ${CONTAINER_NAME}${NC}"
echo ""

# Safety confirmation
read -p "Are you absolutely sure you want to reset the PRODUCTION database? (type 'yes' to confirm): " confirmation
if [ "$confirmation" != "yes" ]; then
    echo "❌ Reset cancelled. Database unchanged."
    exit 0
fi

# Check if container is running
echo "🔍 Checking if PostgreSQL container is running..."
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}❌ PostgreSQL container '$CONTAINER_NAME' is not running!${NC}"
    echo "Please start it first with: docker-compose -f docker-compose.prod.yml up -d postgres"
    exit 1
fi

# Check if container is healthy
echo "🔍 Checking container health..."
if ! docker ps --format "{{.Names}}\t{{.Status}}" | grep "$CONTAINER_NAME" | grep -q "healthy"; then
    echo -e "${YELLOW}⚠️  Warning: Container '$CONTAINER_NAME' is not healthy!${NC}"
    read -p "Continue anyway? (type 'yes' to continue): " continue_anyway
    if [ "$continue_anyway" != "yes" ]; then
        echo "❌ Reset cancelled."
        exit 1
    fi
fi

# Get database password if not set
if [ -z "$DB_PASSWORD" ]; then
    echo "🔐 Database password not set in environment."
    echo "You can set it via: export DB_PASSWORD='your_password'"
    read -sp "Enter database password: " DB_PASSWORD
    echo ""
    if [ -z "$DB_PASSWORD" ]; then
        echo -e "${RED}❌ Password is required!${NC}"
        exit 1
    fi
fi

# Optional backup before reset
echo ""
read -p "Do you want to create a backup before resetting? (recommended) [y/N]: " create_backup
if [[ "$create_backup" =~ ^[Yy]$ ]]; then
    BACKUP_DIR="./backups"
    mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/treesindia_backup_${TIMESTAMP}.sql"
    
    echo "📦 Creating backup to $BACKUP_FILE..."
    if docker exec -e PGPASSWORD="$DB_PASSWORD" "$CONTAINER_NAME" \
        pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"; then
        echo -e "${GREEN}✅ Backup created successfully: $BACKUP_FILE${NC}"
        # Compress backup
        gzip "$BACKUP_FILE" 2>/dev/null || true
        echo "   Compressed to: ${BACKUP_FILE}.gz"
    else
        echo -e "${RED}❌ Backup failed!${NC}"
        read -p "Continue with reset anyway? (type 'yes' to continue): " continue_anyway
        if [ "$continue_anyway" != "yes" ]; then
            echo "❌ Reset cancelled."
            exit 1
        fi
    fi
fi

# Final confirmation
echo ""
echo -e "${RED}⚠️  FINAL WARNING: About to DROP database '$DB_NAME'${NC}"
read -p "Type 'RESET PRODUCTION' to confirm: " final_confirmation
if [ "$final_confirmation" != "RESET PRODUCTION" ]; then
    echo "❌ Reset cancelled. Database unchanged."
    exit 0
fi

# Drop and recreate the database
echo ""
echo "🔄 Resetting database..."
echo "📦 Dropping existing database..."
if docker exec -e PGPASSWORD="$DB_PASSWORD" "$CONTAINER_NAME" \
    psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"; then
    echo -e "${GREEN}✅ Database dropped${NC}"
else
    echo -e "${RED}❌ Failed to drop database!${NC}"
    exit 1
fi

echo "📦 Creating new database..."
if docker exec -e PGPASSWORD="$DB_PASSWORD" "$CONTAINER_NAME" \
    psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"; then
    echo -e "${GREEN}✅ Database created${NC}"
else
    echo -e "${RED}❌ Failed to create database!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Database reset complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Restart the backend application to run migrations:"
echo "     docker-compose -f docker-compose.prod.yml restart backend"
echo "  2. Or if using standalone backend:"
echo "     The application will automatically run migrations on startup"
echo ""
if [ -n "$BACKUP_FILE" ]; then
    echo -e "${YELLOW}💾 Backup saved to: ${BACKUP_FILE}.gz${NC}"
fi

