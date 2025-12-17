.PHONY: build build-prod run run-prod install deps clean help

# Default target
help:
	@echo "Available targets:"
	@echo "  make install         - Install dependencies and goose"
	@echo "  make build           - Build the application (development)"
	@echo "  make build-prod      - Build for current platform (production optimized)"
	@echo "  make build-prod-linux - Build for Linux server (production optimized)"
	@echo "  make run             - Build and run the application (development)"
	@echo "  make run-prod        - Build and run the application (production)"
	@echo "  make deps            - Download Go dependencies"
	@echo "  make clean           - Clean build artifacts"

# Install dependencies and tools
install: deps
	@echo "Installing goose migration tool..."
	@go install github.com/pressly/goose/v3/cmd/goose@latest
	@echo "✓ Installation complete"

# Download dependencies
deps:
	@echo "Downloading Go dependencies..."
	@go mod download
	@go mod tidy
	@echo "✓ Dependencies downloaded"

# Build the application (development)
build:
	@echo "Updating go.mod..."
	@go mod tidy
	@echo "Building application (development mode)..."
	@go build -o main .
	@echo "✓ Build complete: ./main"

# Build the application (production) - for current platform
build-prod:
	@echo "Updating go.mod..."
	@go mod tidy
	@echo "Building application (production mode with optimizations)..."
	@echo "This may take a few minutes, please wait..."
	@go build -v -ldflags="-w -s" -o main . 2>&1 | tail -20
	@echo "✓ Production build complete: ./main"

# Build for Linux (for deployment to Linux server)
build-prod-linux:
	@echo "Building application for Linux (production mode with optimizations)..."
	@CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
		-a -installsuffix cgo \
		-ldflags="-w -s -extldflags '-static'" \
		-o main-linux .
	@echo "✓ Linux production build complete: ./main-linux"

# Build and run (development)
run: build
	@echo "Starting server (development mode)..."
	@ENV=development ./main

# Build and run (production)
run-prod: build-prod
	@if [ ! -f .env.production ]; then \
		echo "❌ Error: .env.production file not found!"; \
		echo "   Please create .env.production with production configuration."; \
		exit 1; \
	fi
	@echo "Starting server (production mode)..."
	@ENV=production ./main

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -f main main.exe
	@go clean
	@echo "✓ Clean complete"



