# TREESINDIA Backend - Completed Routes

This document outlines all the completed API routes in the TREESINDIA backend application.

## Base URL

All routes are prefixed with `/api/v1`

## API Documentation

- **Swagger UI**: `/swagger/*any` - Interactive API documentation

## 1. Health Routes

### Health Check

- **GET** `/api/v1/health`
- **Description**: Get server health status and system information
- **Authentication**: Not required
- **Response**: Server health information including:
  - Status
  - Version
  - Environment
  - Timestamp
  - Uptime
  - Database status
  - System information (Go version, platform, CPU count, memory usage)

## 2. Authentication Routes

### Public Routes (No Authentication Required)

#### User Registration

- **POST** `/api/v1/auth/register`
- **Description**: Register a new user account
- **Authentication**: Not required

#### User Login

- **POST** `/api/v1/auth/login`
- **Description**: Authenticate user and get access token
- **Authentication**: Not required

#### OTP Verification

- **POST** `/api/v1/auth/verify-otp`
- **Description**: Verify OTP for user authentication
- **Authentication**: Not required

#### Token Refresh

- **POST** `/api/v1/auth/refresh-token`
- **Description**: Refresh access token using refresh token
- **Authentication**: Not required

### Protected Routes (Authentication Required)

#### Get Current User

- **GET** `/api/v1/auth/me`
- **Description**: Get current authenticated user information
- **Authentication**: Required (Bearer token)

#### User Logout

- **POST** `/api/v1/auth/logout`
- **Description**: Logout user and invalidate tokens
- **Authentication**: Required (Bearer token)

## 3. Admin Routes

### Admin Seeding

- **POST** `/api/v1/admin/seed`
- **Description**: Seed admin users in the system
- **Authentication**: Required (Admin access)

### User Management

- **GET** `/api/v1/admin/users`
- **Description**: Get all users in the system
- **Authentication**: Required (Admin access)

## 4. Category Routes

### Public Category Routes (No Authentication Required)

#### Get All Categories

- **GET** `/api/v1/categories`
- **Description**: Get all categories with optional filtering
- **Authentication**: Not required

#### Get Category by ID

- **GET** `/api/v1/categories/:id`
- **Description**: Get specific category by ID
- **Authentication**: Not required

### Admin Category Routes (Admin Authentication Required)

#### Create Category

- **POST** `/api/v1/admin/categories`
- **Description**: Create new category or subcategory
- **Authentication**: Required (Admin access)

## Route Summary

| Method | Route                        | Description        | Authentication |
| ------ | ---------------------------- | ------------------ | -------------- |
| GET    | `/api/v1/health`             | Health check       | None           |
| POST   | `/api/v1/auth/register`      | User registration  | None           |
| POST   | `/api/v1/auth/login`         | User login         | None           |
| POST   | `/api/v1/auth/verify-otp`    | OTP verification   | None           |
| POST   | `/api/v1/auth/refresh-token` | Token refresh      | None           |
| GET    | `/api/v1/auth/me`            | Get current user   | Required       |
| POST   | `/api/v1/auth/logout`        | User logout        | Required       |
| POST   | `/api/v1/admin/seed`         | Seed admin users   | Admin          |
| GET    | `/api/v1/admin/users`        | Get all users      | Admin          |
| GET    | `/api/v1/categories`         | Get all categories | None           |
| GET    | `/api/v1/categories/:id`     | Get category by ID | None           |
| POST   | `/api/v1/admin/categories`   | Create category    | Admin          |

## Authentication Levels

1. **None**: Public routes accessible without authentication
2. **Required**: Routes requiring valid JWT token
3. **Admin**: Routes requiring both authentication and admin privileges

## Middleware Used

- **AuthMiddleware**: Validates JWT tokens for protected routes
- **AdminMiddleware**: Ensures user has admin privileges
- **Response Middleware**: Standardizes API responses

## Response Format

All API responses follow a standardized format:

```json
{
  "success": true/false,
  "message": "Response message",
  "data": {},
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Error Handling

The API includes comprehensive error handling with appropriate HTTP status codes and descriptive error messages for various scenarios including:

- Validation errors
- Authentication failures
- Authorization failures
- Database errors
- Server errors
