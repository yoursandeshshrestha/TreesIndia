#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   TreesIndia Build Diagnostics        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${YELLOW}1. Checking environment files...${NC}"
echo ""

if [ -f "$SCRIPT_DIR/.env.development" ]; then
    echo -e "${GREEN}✓${NC} .env.development exists"
    grep "EXPO_ENVIRONMENT" "$SCRIPT_DIR/.env.development"
else
    echo -e "${RED}✗${NC} .env.development NOT found"
fi

if [ -f "$SCRIPT_DIR/.env.production" ]; then
    echo -e "${GREEN}✓${NC} .env.production exists"
    grep "EXPO_ENVIRONMENT" "$SCRIPT_DIR/.env.production"
else
    echo -e "${RED}✗${NC} .env.production NOT found"
fi

if [ -f "$SCRIPT_DIR/.env" ]; then
    echo -e "${GREEN}✓${NC} .env exists (currently active)"
    grep "EXPO_ENVIRONMENT" "$SCRIPT_DIR/.env"
    grep "EXPO_PUBLIC_.*_API_URL" "$SCRIPT_DIR/.env"
else
    echo -e "${RED}✗${NC} .env NOT found"
fi

echo ""
echo -e "${YELLOW}2. Checking built APKs...${NC}"
echo ""

DEBUG_APK="$SCRIPT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
RELEASE_APK="$SCRIPT_DIR/android/app/build/outputs/apk/release/app-release.apk"

if [ -f "$DEBUG_APK" ]; then
    SIZE=$(du -h "$DEBUG_APK" | cut -f1)
    MODIFIED=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$DEBUG_APK")
    echo -e "${GREEN}✓${NC} Debug APK: $SIZE (modified: $MODIFIED)"
else
    echo -e "${RED}✗${NC} Debug APK not found"
fi

if [ -f "$RELEASE_APK" ]; then
    SIZE=$(du -h "$RELEASE_APK" | cut -f1)
    MODIFIED=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$RELEASE_APK")
    echo -e "${GREEN}✓${NC} Release APK: $SIZE (modified: $MODIFIED)"
else
    echo -e "${RED}✗${NC} Release APK not found"
fi

echo ""
echo -e "${YELLOW}3. Checking cache directories...${NC}"
echo ""

if [ -d "$SCRIPT_DIR/node_modules/.cache" ]; then
    echo -e "${YELLOW}⚠${NC} Metro cache exists (should be cleared before rebuild)"
else
    echo -e "${GREEN}✓${NC} Metro cache is clean"
fi

if [ -d "$SCRIPT_DIR/.expo" ]; then
    echo -e "${YELLOW}⚠${NC} Expo cache exists (should be cleared before rebuild)"
else
    echo -e "${GREEN}✓${NC} Expo cache is clean"
fi

echo ""
echo -e "${YELLOW}4. Testing API connectivity...${NC}"
echo ""

echo "Testing production API..."
if curl -s -o /dev/null -w "%{http_code}" https://api.treesindiaservices.com/api/v1/health 2>&1 | grep -q "000"; then
    echo -e "${RED}✗${NC} Cannot reach production API (network error)"
else
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://api.treesindiaservices.com/api/v1/health 2>&1)
    if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓${NC} Production API is reachable (HTTP $HTTP_CODE)"
    else
        echo -e "${YELLOW}⚠${NC} Production API returned HTTP $HTTP_CODE"
    fi
fi

echo ""
echo -e "${YELLOW}5. Checking Android manifest...${NC}"
echo ""

MANIFEST="$SCRIPT_DIR/android/app/src/main/AndroidManifest.xml"
if grep -q "android.permission.INTERNET" "$MANIFEST"; then
    echo -e "${GREEN}✓${NC} INTERNET permission present"
else
    echo -e "${RED}✗${NC} INTERNET permission missing"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}Diagnostics complete!${NC}"
echo ""
echo -e "${YELLOW}Common issues:${NC}"
echo "  • If caches exist, run: rm -rf node_modules/.cache .expo"
echo "  • If wrong .env active, rebuild using ./build-apk.sh"
echo "  • Check app logs for 'API Configuration' on startup"
echo ""
