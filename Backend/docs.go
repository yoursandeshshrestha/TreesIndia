// Package main TREESINDIA API.
//
// TREESINDIA is a unified digital platform that combines home services and real estate marketplace.
//
//	Schemes: http, https
//	Host: localhost:8080
//	BasePath: /api/v1
//	Version: 1.0.0
//
//	Consumes:
//	- application/json
//
//	Produces:
//	- application/json
//
//	Security:
//	- bearer
//
// swagger:meta
package main

// @title TREESINDIA API
// @version 1.0
// @description TREESINDIA is a unified digital platform that combines home services and real estate marketplace with advanced features like AI assistance, call masking, and privacy protection.
// @termsOfService http://swagger.io/terms/

// @contact.name TREESINDIA Support
// @contact.url https://treesindia.com/support
// @contact.email support@treesindia.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

// @tag.name Authentication
// @tag.description Authentication endpoints for user registration, login, and OTP verification

// @tag.name Users
// @tag.description User management endpoints

// @tag.name Admin
// @tag.description Admin-only endpoints for platform management

// @tag.name Categories
// @tag.description Category management endpoints
