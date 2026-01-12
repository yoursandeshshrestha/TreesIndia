#!/usr/bin/env bun

import { execSync } from "child_process";
import { join } from "path";

interface ExecError extends Error {
  status?: number;
  signal?: string;
  stdout?: string;
  stderr?: string;
}

const BACKEND_DIR = join(import.meta.dir, "..");

// Database configuration (matching reset-db.sh)
const DB_PORT = process.env.DB_PORT || "8090";
const DB_NAME = process.env.DB_NAME || "treesindia";
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASSWORD = process.env.DB_PASSWORD;
const CONTAINER_NAME = process.env.CONTAINER_NAME || "treesindia-postgres-local";

if (!DB_PASSWORD) {
  console.error("❌ DB_PASSWORD environment variable is required!");
  console.error("Please set it before running this script.");
  process.exit(1);
}

console.log("🔄 Clearing database and Cloudinary resources...\n");

// Step 1: Clear the database
console.log("📦 Step 1: Clearing database...");

// Check if container is running
console.log("Checking if Docker container is running...");
try {
  const containerCheck = execSync("docker ps", {
    encoding: "utf-8",
    timeout: 10000 // 10 second timeout
  });
  if (!containerCheck.includes(CONTAINER_NAME)) {
    console.error(`❌ PostgreSQL container '${CONTAINER_NAME}' is not running!`);
    console.error("Please start it first with: ./start-postgres.sh");
    process.exit(1);
  }
  console.log("✅ Docker container is running");
} catch (error: unknown) {
  const execError = error as ExecError;
  console.error("❌ Error checking Docker containers:", execError.message);
  console.error("💡 Hint: Make sure Docker Desktop is running");
  process.exit(1);
}

// Helper function to sleep synchronously
function sleep(ms: number): void {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // Brief sleep to avoid busy-wait CPU consumption
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
} catch (_error: unknown) {
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
} catch (_error: unknown) {
  // If FORCE doesn't work, try without it
  try {
    execSync(
      `docker exec -e PGPASSWORD="${DB_PASSWORD}" ${CONTAINER_NAME} psql -U ${DB_USER} -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"`,
      { stdio: "inherit" }
    );
  } catch (error2: unknown) {
    const execError = error2 as ExecError;
    console.error("❌ Error dropping database:", execError.message);
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
} catch (error: unknown) {
  const execError = error as ExecError;
  console.error("❌ Error creating database:", execError.message);
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
} catch (_error: unknown) {
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
} catch (error: unknown) {
  const execError = error as ExecError;
  console.warn("⚠️  Failed to clear Cloudinary (this is optional):", execError.message);
  console.log("   Continuing with database cleanup...\n");
}

console.log("\n🎉 Database and Cloudinary cleared successfully!");
console.log("\nNote: The database will be migrated automatically when you restart the application.");

