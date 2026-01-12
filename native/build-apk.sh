#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DESKTOP_DIR="$HOME/Desktop"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     TreesIndia APK Build Script       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Ask user for build type
echo -e "${YELLOW}Select build type:${NC}"
echo "  1) Dev (Debug build - for testing)"
echo "  2) Prod (Release build - for production)"
echo ""
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        BUILD_TYPE="debug"
        BUILD_VARIANT="Debug"
        GRADLE_TASK="assembleDebug"
        APK_NAME="app-debug.apk"
        OUTPUT_NAME="TreesIndia-dev-$(date +%Y%m%d-%H%M%S).apk"
        ENV_FILE=".env.development"
        ;;
    2)
        BUILD_TYPE="release"
        BUILD_VARIANT="Release"
        GRADLE_TASK="assembleRelease"
        APK_NAME="app-release.apk"
        OUTPUT_NAME="TreesIndia-prod-$(date +%Y%m%d-%H%M%S).apk"
        ENV_FILE=".env.production"

        # Check if release keystore exists
        if [ ! -f "$SCRIPT_DIR/android/keystore.properties" ]; then
            echo ""
            print_warning "Release keystore not found!"
            echo -e "${YELLOW}For Play Store distribution, you need a release keystore.${NC}"
            echo ""
            echo "Options:"
            echo "  1) Continue with debug keystore (NOT for Play Store)"
            echo "  2) Generate release keystore now"
            echo "  3) Cancel build"
            echo ""
            read -p "Enter your choice (1, 2, or 3): " keystore_choice

            case $keystore_choice in
                1)
                    print_warning "Building with debug keystore. Do NOT upload to Play Store!"
                    ;;
                2)
                    echo ""
                    print_info "Launching keystore generator..."
                    "$SCRIPT_DIR/generate-keystore.sh"
                    if [ $? -ne 0 ]; then
                        print_error "Keystore generation failed."
                        exit 1
                    fi
                    echo ""
                    print_info "Continuing with build..."
                    ;;
                3)
                    print_info "Build cancelled."
                    exit 0
                    ;;
                *)
                    print_error "Invalid choice. Build cancelled."
                    exit 1
                    ;;
            esac
        fi
        ;;
    *)
        print_error "Invalid choice. Please run the script again and select 1 or 2."
        exit 1
        ;;
esac

echo ""
print_info "Setting up environment: $ENV_FILE"

# Check if environment file exists
if [ ! -f "$SCRIPT_DIR/$ENV_FILE" ]; then
    print_error "Environment file $ENV_FILE not found!"
    exit 1
fi

# Copy the selected environment file to .env
cp "$SCRIPT_DIR/$ENV_FILE" "$SCRIPT_DIR/.env"
print_success "Using environment: $ENV_FILE"
echo ""

# Clear Metro bundler cache to ensure fresh environment variables
print_info "Clearing Metro bundler cache..."
cd "$SCRIPT_DIR"
rm -rf node_modules/.cache
rm -rf .expo
print_success "Cache cleared"
echo ""

print_info "Building ${BUILD_VARIANT} APK..."
echo ""

# Check if android directory exists
if [ ! -d "$SCRIPT_DIR/android" ]; then
    print_error "Android directory not found. Please run 'npm run prebuild' first."
    exit 1
fi

# Navigate to android directory
cd "$SCRIPT_DIR/android"

# Set Java 17 for build (required for CMake compatibility)
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

print_info "Using Java version: $(java -version 2>&1 | head -1)"
echo ""

# Clean previous builds (skip if it fails - often happens on first build)
print_info "Cleaning previous builds..."
./gradlew clean 2>/dev/null || print_warning "Clean skipped (this is normal for first build)"
echo ""

# Build APK
print_info "Building ${BUILD_VARIANT} APK (this may take several minutes)..."
./gradlew $GRADLE_TASK --no-daemon

if [ $? -ne 0 ]; then
    print_error "Build failed. Please check the error messages above."
    exit 1
fi

print_success "Build completed successfully!"
echo ""

# Find the APK file
APK_PATH="$SCRIPT_DIR/android/app/build/outputs/apk/$BUILD_TYPE/$APK_NAME"

if [ ! -f "$APK_PATH" ]; then
    print_error "APK file not found at: $APK_PATH"
    exit 1
fi

# Copy to Desktop
print_info "Copying APK to Desktop..."
cp "$APK_PATH" "$DESKTOP_DIR/$OUTPUT_NAME"

if [ $? -ne 0 ]; then
    print_error "Failed to copy APK to Desktop."
    exit 1
fi

# Get APK size
APK_SIZE=$(du -h "$DESKTOP_DIR/$OUTPUT_NAME" | cut -f1)

echo ""
print_success "APK successfully built and copied to Desktop!"
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}Build Summary:${NC}"
echo -e "  Type:     ${BUILD_VARIANT}"
echo -e "  Size:     ${APK_SIZE}"
echo -e "  Location: ${DESKTOP_DIR}/${OUTPUT_NAME}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""

# Ask if user wants to open Desktop folder
read -p "Open Desktop folder? (y/n): " open_choice
if [[ $open_choice == "y" || $open_choice == "Y" ]]; then
    open "$DESKTOP_DIR"
fi

echo ""
print_success "Done!"
echo ""
