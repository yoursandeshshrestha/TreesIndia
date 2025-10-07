# TREESINDIA Backend

Simple Go backend for TREESINDIA platform with basic setup, live reload, and sample items with database seeding.

## 🏗️ Architecture

- **Framework**: Gin (Go web framework)
- **Configuration**: Viper + Environment variables
- **Database**: PostgreSQL with GORM
- **Live Reload**: Air

## 📁 Project Structure

```
backend/
├── config/           # Configuration management
├── models/          # Data models (Item)
├── seed/            # Database seeding
├── controllers/     # HTTP request handlers
├── views/           # Response structures
├── middleware/      # Custom middleware
├── routes/          # Route definitions and constants
├── main.go         # Application entry point
├── go.mod          # Go module file
├── air.toml        # Live reload configuration
└── README.md       # This file
```

## 🚀 Quick Start

### Prerequisites

- Go 1.21+
- Air (for live reload)
- PostgreSQL database (Supabase recommended)

### Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**

   ```bash
   go mod tidy
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   # Edit .env with your actual database values
   ```

4. **Install Air (if not already installed)**

   ```bash
   go install github.com/air-verse/air@latest
   ```

5. **Run with live reload (recommended for development)**

   ```bash
   air
   ```

6. **Run without live reload**
   ```bash
   go run main.go
   ```

## 🌍 Environment Setup

### Prerequisites

- Go 1.21+ installed
- PostgreSQL database accessible (Supabase recommended)
- Air for live reload

### Environment Setup

1. **Copy environment file**

   ```bash
   cp env.example .env
   ```

2. **Edit environment variables**
   ```bash
   # Edit .env file with your database connection
   DATABASE_URL=postgresql://username:password@host:5432/treesindia
   ```

### Development Commands

1. **Start development server with live reload**

   ```bash
   air
   ```

2. **Start without live reload**

   ```bash
   go run main.go
   ```

3. **Build the application**

   ```bash
   go build -o main .
   ```

4. **Run tests**

   ```bash
   go test ./...
   ```

5. **Clean build cache**
   ```bash
   go clean -cache
   ```

## 📡 API Endpoints

### Health Check

- **GET** `/api/v1/health` - Server health status

### Items

- **GET** `/api/v1/items/` - Get all items
- **GET** `/api/v1/items/:id` - Get item by ID

### Application Info

- **GET** `/` - Application information

## 🔧 Configuration

### Environment Variables

| Variable             | Description                          | Default                                |
| -------------------- | ------------------------------------ | -------------------------------------- |
| `PORT`               | Server port                          | `8080`                                 |
| `ENV`                | Environment (development/production) | `development`                          |
| `DATABASE_URL`       | PostgreSQL connection string         | Required                               |
| `GIN_MODE`           | Gin mode (debug/release)             | `debug`                                |
| `TWO_FACTOR_API_KEY` | 2Factor API key for OTP sending      | `d02b4b18-9889-11f0-b922-0200cd936042` |
| `TWO_FACTOR_API_URL` | 2Factor API base URL                 | `https://2factor.in/API/V1`            |

### OTP Configuration

The backend uses 2Factor API for sending dynamic OTPs:

1. **Get your API key**: Sign up at [2Factor.in](https://2factor.in/) to get your API key
2. **Set environment variable**: Add `TWO_FACTOR_API_KEY` to your `.env` file
3. **OTP Configuration**:
   - **OTP Length**: 6 digits
   - **Expiry Time**: 5 minutes (300 seconds)
   - **Max Attempts**: 5 attempts per OTP
   - **Purpose Types**: `login`, `account_deletion`

**Example .env configuration:**

```bash
TWO_FACTOR_API_KEY=your-2factor-api-key-here
TWO_FACTOR_API_URL=https://2factor.in/API/V1
```

### Air Configuration

The `air.toml` file configures live reload behavior:

- **Watch directories**: `config/`, `controllers/`, `middleware/`, `models/`, `routes/`, `views/`
- **Exclude directories**: `tmp/`
- **Build command**: `go build -o ./tmp/main .`
- **Run command**: `./tmp/main`

## 🗄️ Database

### Setup

1. **Create database**

   ```sql
   CREATE DATABASE treesindia;
   ```

2. **Run migrations** (handled automatically by GORM)

3. **Seed data** (handled automatically on startup)

### Models

- **Item**: Basic item model with CRUD operations

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   # Kill the process or change port in .env
   lsof -i :8080
   kill -9 <PID>
   ```

2. **Database connection failed**

   - Check your `DATABASE_URL` in `.env`
   - Ensure database is accessible
   - Verify network connectivity

3. **Air not working**

   ```bash
   # Reinstall Air
   go install github.com/air-verse/air@latest
   ```

4. **Dependencies issues**
   ```bash
   # Clean and reinstall
   go clean -modcache
   go mod tidy
   ```

## 📝 Development Workflow

1. **Start development server**

   ```bash
   air
   ```

2. **Make changes to your code**

   - Air will automatically detect changes
   - Server will restart automatically

3. **Test your changes**

   ```bash
   curl http://localhost:8080/api/v1/health
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

## 🎯 Features

- **Live Reload**: Automatic server restart on code changes
- **Database Seeding**: Sample data automatically loaded
- **Health Checks**: Built-in health monitoring
- **Structured Logging**: Comprehensive logging with logrus
- **Error Handling**: Proper error responses and middleware
- **Configuration Management**: Environment-based configuration

## 📄 License

This project is licensed under the MIT License.
