# Database Migrations

This directory contains clean database migrations that only create tables and relationships. All modification, fix, and data insertion migrations have been removed and consolidated.

## Migration Structure

The migrations are organized in logical dependency order:

### Base Tables (No Dependencies)

- **001_create_users.sql** - Users table with all user-related fields
- **002_create_categories.sql** - Service categories
- **005_create_subscription_plans.sql** - Subscription plan definitions
- **014_create_admin_configs.sql** - Admin configuration settings
- **017_create_service_areas.sql** - Service area definitions

### Tables with Dependencies

- **003_create_subcategories.sql** - Depends on categories
- **004_create_services.sql** - Depends on categories and subcategories
- **006_create_user_subscriptions.sql** - Depends on users and subscription_plans
- **007_create_user_dependent_tables.sql** - Multiple tables that depend on users:
  - locations (primary location per user)
  - addresses (multiple addresses per user)
  - user_documents
  - user_skills
  - role_applications
  - user_notification_settings
  - subscription_warnings
- **008_create_service_dependent_tables.sql** - Empty (service-dependent tables handled elsewhere)
- **010_create_workers_brokers_contractors.sql** - Depends on users and services:
  - workers
  - brokers
- **011_create_bookings.sql** - Depends on users and services
- **012_create_booking_dependent_tables.sql** - Tables that depend on bookings:
  - worker_assignments
  - buffer_requests
- **013_create_wallet_transactions.sql** - Depends on users
- **016_create_payments_table.sql** - Depends on users
- **018_create_chat_system.sql** - Chat system tables:
  - chat_rooms
  - chat_messages
  - chat_room_participants
- **019_create_worker_inquiries.sql** - Depends on users and services
- **020_create_properties_table.sql** - Real estate properties table (depends on users)

### Performance and Structure

- **015_create_indexes_and_views.sql** - All database indexes for optimal performance

## Key Features

1. **Clean Structure**: Only table creation and relationships, no modifications or data insertions
2. **Proper Dependencies**: Tables are created in the correct order based on foreign key relationships
3. **Complete Schema**: All current model fields are included
4. **Performance Optimized**: Includes all necessary indexes
5. **Consistent Naming**: All tables follow consistent naming conventions
6. **Proper Constraints**: Includes check constraints and foreign key relationships

## Table Relationships

### User-Related Tables

- `users` - Main user table
- `locations` - Primary location per user (1:1)
- `addresses` - Multiple addresses per user (1:many)
- `user_documents` - User documents (1:many)
- `user_skills` - User skills (1:many)
- `role_applications` - Role applications (1:many)
- `user_notification_settings` - Notification settings (1:1)
- `subscription_warnings` - Subscription warnings (1:many)

### Service-Related Tables

- `categories` - Service categories
- `subcategories` - Service subcategories (belongs to categories)
- `services` - Services (belongs to categories and subcategories)
- `service_areas` - Service areas
- `service_service_areas` - Junction table for services and service areas

### Booking-Related Tables

- `bookings` - Main bookings table (belongs to users and services)
- `worker_assignments` - Worker assignments (belongs to bookings and workers)
- `buffer_requests` - Buffer requests (belongs to bookings and workers)

### Worker-Related Tables

- `workers` - Workers (belongs to users and services)
- `brokers` - Brokers (belongs to users)
- `worker_inquiries` - Worker inquiries (belongs to users and services)

### Property-Related Tables

- `properties` - Real estate properties (belongs to users, optional broker)

### Payment and Financial Tables

- `payments` - Payment transactions (belongs to users)
- `wallet_transactions` - Wallet transactions (belongs to users)
- `subscription_plans` - Subscription plan definitions
- `user_subscriptions` - User subscriptions (belongs to users and subscription_plans)

### Communication Tables

- `chat_rooms` - Chat rooms
- `chat_messages` - Chat messages (belongs to chat_rooms and users)
- `chat_room_participants` - Chat room participants (junction table)

### System Tables

- `admin_configs` - Admin configuration settings

## Usage

To apply these migrations:

```bash
# Apply all migrations
goose up

# Apply specific migration
goose up 001_create_users.sql

# Rollback specific migration
goose down 001_create_users.sql
```

## Notes

- All timestamps use `TIMESTAMPTZ` for timezone awareness
- All tables include `created_at`, `updated_at`, and `deleted_at` fields for GORM compatibility
- Foreign key relationships are properly defined with appropriate cascade rules
- Indexes are created for frequently queried fields
- Check constraints are added where appropriate for data integrity
