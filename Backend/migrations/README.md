# Database Migrations

This directory contains all database migrations for the TreesIndia application using Goose.

## Migration Order

The migrations are executed in numerical order to ensure proper dependency resolution:

### Base Tables (No Dependencies)

- `001_create_users.sql` - Users table
- `002_create_categories.sql` - Categories table
- `005_create_subscription_plans.sql` - Subscription plans table
- `014_create_admin_configs.sql` - Admin configurations table

### Dependent Tables

- `003_create_subcategories.sql` - Depends on categories
- `004_create_services.sql` - Depends on categories and subcategories
- `006_create_user_subscriptions.sql` - Depends on users and subscription_plans
- `007_create_user_dependent_tables.sql` - Depends on users
- `008_create_service_dependent_tables.sql` - Depends on services
- `009_create_properties.sql` - Depends on users
- `010_create_workers_brokers_contractors.sql` - Depends on users and services
- `011_create_bookings.sql` - Depends on users, services, and time_slots
- `012_create_booking_dependent_tables.sql` - Depends on bookings
- `013_create_wallet_transactions.sql` - Depends on users, services, properties, and user_subscriptions

### Performance Optimizations

- `015_add_indexes_and_views.sql` - Adds indexes and views for better performance

### Seed Data

- `016_insert_default_data.sql` - Inserts default configurations and seed data

## Running Migrations

### Using the script:

```bash
./run_migrations.sh
```

### Direct command:

```bash
goose -dir migrations postgres "postgres://postgres:123amit@localhost:5432/postgres?sslmode=disable" up
```

### Check status:

```bash
goose -dir migrations postgres "postgres://postgres:123amit@localhost:5432/postgres?sslmode=disable" status
```

### Rollback:

```bash
goose -dir migrations postgres "postgres://postgres:123amit@localhost:5432/postgres?sslmode=disable" down
```

## Advantages of Goose

1. **Fast Execution** - No GORM overhead, direct SQL
2. **Proper Order** - Numerical file naming ensures correct sequence
3. **No Dependency Issues** - Foreign keys created in correct order
4. **Rollback Support** - Each migration has up/down scripts
5. **Production Ready** - Used by many large companies
6. **Clear Tracking** - Migration status is tracked in database

## Migration Performance

Expected execution time: **~2-5 seconds** (vs 30+ seconds with GORM AutoMigrate)

## Tables Created

- users
- categories
- subcategories
- services
- subscription_plans
- user_subscriptions
- locations
- user_documents
- user_skills
- role_applications
- user_notification_settings
- user_roles
- subscription_warnings
- service_configs
- time_slots
- properties
- workers
- brokers
- contractors
- bookings
- worker_assignments
- buffer_requests
- wallet_transactions
- admin_configs

Plus indexes, views, and seed data.



