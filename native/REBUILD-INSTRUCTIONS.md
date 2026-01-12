# How to Rebuild APK with Correct Environment

## The Problem
Environment variables were cached during previous builds, causing the wrong API URL to be used.

## Solution Steps

### 1. Clean Previous Builds
```bash
cd native

# Remove cached files
rm -rf node_modules/.cache
rm -rf .expo
rm -rf android/app/build

# Clean Gradle cache
cd android && ./gradlew clean && cd ..
```

### 2. Rebuild with Correct Environment
```bash
# Run the build script
./build-apk.sh

# Choose option 2 for Production build
# The script will automatically:
# - Use .env.production (EXPO_ENVIRONMENT=prod)
# - Clear Metro cache
# - Build fresh APK with production API URL
```

### 3. Verify the Configuration
After installing the APK on your device:
1. Open the app
2. Check LogCat or React Native logs
3. Look for this output:
   ```
   === TreesIndia API Configuration ===
   Environment: prod
   API Base URL: https://api.treesindiaservices.com/api/v1
   =====================================
   ```

## Environment Files

- **`.env.development`** - Used for dev builds (Option 1)
  - `EXPO_ENVIRONMENT=dev`
  - Uses local API: `http://192.168.1.46:8080/api/v1`

- **`.env.production`** - Used for prod builds (Option 2)
  - `EXPO_ENVIRONMENT=prod`
  - Uses production API: `https://api.treesindiaservices.com/api/v1`

## Troubleshooting

### Still Getting Network Errors?

1. **Check logs** - The app now prints the API URL on startup
2. **Verify API is accessible** - Test: `curl https://api.treesindiaservices.com/api/v1/health`
3. **Check internet connection** - Make sure the device has internet access
4. **Check firewall/security** - Ensure the API server isn't blocking requests

### API Returns 404 or Other Errors?

This is different from "network request failed":
- 404 = API is reachable but endpoint doesn't exist
- Network error = Can't reach API at all

Check your API server logs to see what's happening.
