# Admin Configuration Guide

## Overview

The TREESINDIA platform uses a dynamic configuration system that allows administrators to control various system behaviors without requiring code changes. All configurations are stored in the database and can be managed through the admin interface.

## How to Access Configuration Keys

### 1. Through the Admin Interface

When creating a new configuration in the admin panel:

1. **Navigate to Admin Configs** in your admin dashboard
2. **Click "Add New Configuration"**
3. **Click "Available Keys"** button next to the Configuration Key field
4. **Browse available keys** organized by category
5. **Click on any key** to auto-fill the form with:
   - Key name
   - Data type
   - Category
   - Description
   - Default value

### 2. Through API Endpoints

You can also discover available keys through these API endpoints:

```bash
# Get all available configuration keys with descriptions
GET /api/v1/admin/configs/available-keys

# Get configuration templates
GET /api/v1/admin/configs/templates

# Get complete configuration schemas
GET /api/v1/admin/configs/schemas
```

## Configuration Categories

### System

Controls core system functionality and features.

**Available Keys:**

- `maintenance_mode` - Enable/disable maintenance mode
- `enable_avatar_upload` - Allow users to upload profile pictures
- `enable_user_registration` - Allow new user registrations
- `require_email_verification` - Require email verification
- `require_sms_verification` - Require SMS verification
- `session_timeout_minutes` - User session timeout
- `max_login_attempts` - Maximum login attempts before lockout
- `avatar_max_size_mb` - Maximum avatar file size
- `document_max_size_mb` - Maximum document file size
- `support_email` - Support email address
- `support_phone` - Support phone number
- `default_language` - Default application language
- `default_timezone` - Default application timezone

### Wallet

Controls wallet and payment system behavior.

**Available Keys:**

- `default_wallet_limit` - Default wallet limit for new users
- `min_recharge_amount` - Minimum recharge amount
- `max_recharge_amount` - Maximum single recharge amount

### Property

Controls property listing and management features.

**Available Keys:**

- `property_expiry_days` - Days until property listing expires
- `max_property_images` - Maximum images per property
- `auto_approve_broker_properties` - Auto-approve broker properties
- `max_properties_normal` - Maximum properties for normal users
- `max_properties_broker` - Maximum properties for brokers

### Service

Controls service booking and management features.

**Available Keys:**

- `enable_service_booking` - Enable service booking functionality
- `max_services_per_user` - Maximum services per user

### Payment

Controls payment gateway and transaction settings.

**Available Keys:**

- `payment_gateway_timeout` - Payment gateway timeout
- `enable_payment_retry` - Enable payment retry on failure
- `payment_currency` - Default payment currency

## Data Types

### Boolean (bool)

- **Values**: `true`, `false`, `1`, `0`
- **Use Case**: Feature flags, enable/disable settings
- **Example**: `enable_avatar_upload = true`

### Integer (int)

- **Values**: Whole numbers
- **Use Case**: Limits, counts, timeouts
- **Example**: `max_login_attempts = 5`

### Float (float)

- **Values**: Decimal numbers
- **Use Case**: Amounts, percentages, limits
- **Example**: `default_wallet_limit = 100000.0`

### String (string)

- **Values**: Text
- **Use Case**: URLs, emails, names, settings
- **Example**: `support_email = "support@example.com"`

## How to Create Custom Configurations

### 1. Using Available Keys (Recommended)

1. Click "Available Keys" in the admin interface
2. Browse the categorized list
3. Click on a key to auto-fill the form
4. Modify the value as needed
5. Save the configuration

### 2. Creating Custom Keys

You can also create custom configuration keys:

1. **Key Naming Convention**: Use lowercase with underscores

   - ✅ `enable_new_feature`
   - ✅ `max_items_per_user`
   - ❌ `EnableNewFeature`
   - ❌ `max-items-per-user`

2. **Choose Appropriate Type**:

   - Use `bool` for enable/disable features
   - Use `int` for whole number limits
   - Use `float` for decimal amounts
   - Use `string` for text values

3. **Select Category**: Choose the most appropriate category

4. **Provide Clear Description**: Explain what the configuration controls

## Testing Configurations

### 1. Feature Flags

```json
{
  "key": "enable_avatar_upload",
  "value": "false",
  "type": "bool",
  "category": "system",
  "description": "Enable avatar upload functionality",
  "is_active": true
}
```

**Test**: Try uploading an avatar - should get "Feature disabled" error.

### 2. Limits

```json
{
  "key": "max_properties_normal",
  "value": "2",
  "type": "int",
  "category": "property",
  "description": "Maximum properties for normal users",
  "is_active": true
}
```

**Test**: Normal users should be limited to 2 properties.

### 3. System Settings

```json
{
  "key": "support_email",
  "value": "help@example.com",
  "type": "string",
  "category": "system",
  "description": "Support email address",
  "is_active": true
}
```

**Test**: Check if the new email appears in support forms.

## Dynamic Configuration Examples

### User Type Specific Limits

```json
{
  "key": "max_properties_broker",
  "value": "20",
  "type": "int",
  "category": "property",
  "description": "Maximum properties for broker users",
  "is_active": true
}
```

### Feature Control

```json
{
  "key": "enable_user_reviews",
  "value": "true",
  "type": "bool",
  "category": "system",
  "description": "Enable user review system",
  "is_active": true
}
```

### System Limits

```json
{
  "key": "max_file_upload_size_mb",
  "value": "10",
  "type": "int",
  "category": "system",
  "description": "Maximum file upload size",
  "is_active": true
}
```

## Best Practices

### 1. Key Naming

- Use descriptive, lowercase names with underscores
- Follow the pattern: `[action]_[resource]_[qualifier]`
- Examples: `enable_avatar_upload`, `max_properties_normal`

### 2. Documentation

- Always provide clear descriptions
- Include units where applicable (MB, minutes, INR, etc.)
- Mention default values and ranges

### 3. Testing

- Test configurations in a development environment first
- Verify the behavior changes as expected
- Monitor system performance after changes

### 4. Organization

- Use appropriate categories
- Group related configurations together
- Keep configurations active only when needed

## Troubleshooting

### Configuration Not Working

1. **Check if configuration exists**: Verify the key is in the database
2. **Check if active**: Ensure `is_active` is set to `true`
3. **Check data type**: Verify the value matches the expected type
4. **Check application restart**: Some changes may require restart

### Unknown Configuration Key

1. **Use Available Keys**: Click "Available Keys" to see all valid keys
2. **Check spelling**: Ensure the key name is exactly correct
3. **Create custom key**: If needed, create a new configuration key

### Validation Errors

1. **Check data type**: Ensure value matches the declared type
2. **Check format**: Follow the expected format (e.g., boolean values)
3. **Check ranges**: Ensure values are within acceptable ranges

## API Reference

### Get Available Keys

```bash
GET /api/v1/admin/configs/available-keys
```

### Get Configuration Templates

```bash
GET /api/v1/admin/configs/templates
```

### Create Configuration

```bash
POST /api/v1/admin/configs
Content-Type: application/json

{
  "key": "enable_new_feature",
  "value": "true",
  "type": "bool",
  "category": "system",
  "description": "Enable new feature",
  "is_active": true
}
```

### Update Configuration Value

```bash
PUT /api/v1/admin/configs/key/enable_new_feature/value
Content-Type: application/json

{
  "value": "false"
}
```

This dynamic configuration system gives you complete control over the platform's behavior without requiring any code changes!
