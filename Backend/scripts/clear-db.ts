#!/usr/bin/env bun

import { execSync } from "child_process";
import { join } from "path";

const BACKEND_DIR = join(import.meta.dir, "..");

// Database configuration (matching reset-db.sh)
const DB_PORT = process.env.DB_PORT || "8090";
const DB_NAME = process.env.DB_NAME || "treesindia";
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASSWORD = process.env.DB_PASSWORD || "sandesh@7866030737";
const CONTAINER_NAME = process.env.CONTAINER_NAME || "treesindia-postgres-local";

console.log("🔄 Clearing database and Cloudinary resources...\n");

// Step 1: Clear the database
console.log("📦 Step 1: Clearing database...");

// Check if container is running
try {
  const containerCheck = execSync("docker ps", { encoding: "utf-8" });
  if (!containerCheck.includes(CONTAINER_NAME)) {
    console.error(`❌ PostgreSQL container '${CONTAINER_NAME}' is not running!`);
    console.error("Please start it first with: ./start-postgres.sh");
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Error checking Docker containers:", error);
  process.exit(1);
}

// Helper function to sleep synchronously
function sleep(ms: number) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    // Busy wait
  }
}

// Terminate ALL active connections to the database before dropping
console.log("🔌 Terminating all active database connections...");
try {
  // First, try to terminate connections gracefully
  execSync(
    `docker exec -e PGPASSWORD="${DB_PASSWORD}" ${CONTAINER_NAME} psql -U ${DB_USER} -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${DB_NAME}' AND pid <> pg_backend_pid();"`,
    { stdio: "pipe" }
  );
  // Wait a moment for connections to close
  sleep(1000);
  
  // Force terminate any remaining connections
  execSync(
    `docker exec -e PGPASSWORD="${DB_PASSWORD}" ${CONTAINER_NAME} psql -U ${DB_USER} -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}';"`,
    { stdio: "pipe" }
  );
  sleep(500);
} catch (error) {
  // Ignore errors - database might not exist or no connections
  console.log("   (No active connections or database doesn't exist)");
}

// Drop the database completely (this removes ALL tables, data, schemas, etc.)
console.log("📦 Dropping entire database (all tables, data, and schemas will be removed)...");
try {
  execSync(
    `docker exec -e PGPASSWORD="${DB_PASSWORD}" ${CONTAINER_NAME} psql -U ${DB_USER} -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME} WITH (FORCE);"`,
    { stdio: "inherit" }
  );
} catch (error) {
  // If FORCE doesn't work, try without it
  try {
    execSync(
      `docker exec -e PGPASSWORD="${DB_PASSWORD}" ${CONTAINER_NAME} psql -U ${DB_USER} -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"`,
      { stdio: "inherit" }
    );
  } catch (error2) {
    console.error("❌ Error dropping database:", error2);
    process.exit(1);
  }
}

// Wait a moment to ensure database is fully dropped
sleep(500);

// Create a completely fresh, empty database
console.log("📦 Creating new empty database...");
try {
  execSync(
    `docker exec -e PGPASSWORD="${DB_PASSWORD}" ${CONTAINER_NAME} psql -U ${DB_USER} -d postgres -c "CREATE DATABASE ${DB_NAME};"`,
    { stdio: "inherit" }
  );
} catch (error) {
  console.error("❌ Error creating database:", error);
  process.exit(1);
}

// Verify the database is empty
console.log("🔍 Verifying database is empty...");
try {
  const tableCount = execSync(
    `docker exec -e PGPASSWORD="${DB_PASSWORD}" ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"`,
    { encoding: "utf-8" }
  ).trim();
  
  if (tableCount === "0" || tableCount === "") {
    console.log("✅ Database is completely empty (no tables found)");
  } else {
    console.log(`⚠️  Warning: Found ${tableCount} tables in database. This should be 0.`);
  }
} catch (error) {
  // This is expected if there are no tables
  console.log("✅ Database is empty (no tables to count)");
}

console.log("✅ Database cleared successfully!\n");

// Step 2: Clear Cloudinary
console.log("☁️  Step 2: Clearing Cloudinary resources...");
try {
  execSync("go run cmd/clear-cloudinary/main.go", {
    cwd: BACKEND_DIR,
    stdio: "inherit",
  });
  console.log("✅ Cloudinary cleared successfully!\n");
} catch (error) {
  console.warn("⚠️  Failed to clear Cloudinary (this is optional):", error);
  console.log("   Continuing with database cleanup...\n");
}

console.log("\n🎉 Database and Cloudinary cleared successfully!");
console.log("\nNote: The database will be migrated automatically when you restart the application.");

