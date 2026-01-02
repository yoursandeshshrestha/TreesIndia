# Razorpay Payment Gateway Integration Setup

## Prerequisites

This integration requires a **custom development build** (not Expo Go) because Razorpay uses native modules.

## Installation Steps

### 1. Install Razorpay Package

```bash
npm install react-native-razorpay
# or
bun add react-native-razorpay
```

### 2. Create Development Build

Since Razorpay requires native code, you need to create a development build:

#### Option A: Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure your project
eas build:configure

# Build for development
eas build --profile development --platform ios
# or
eas build --profile development --platform android
```

#### Option B: Using Expo Prebuild

```bash
# Generate native projects
npx expo prebuild

# For iOS
cd ios && pod install && cd ..
npx expo run:ios

# For Android
npx expo run:android
```

### 3. Configure Razorpay Key

Add your Razorpay keys to your environment variables:

**Create/Update `.env` file:**
```
EXPO_ENVIRONMENT=dev  # or 'prod' for production

# Development Razorpay Key
EXPO_PUBLIC_DEV_RAZORPAY_APIKEY=rzp_test_xxxxxxxxxxxxx

# Production Razorpay Key
EXPO_PUBLIC_PROD_RAZORPAY_APIKEY=rzp_live_xxxxxxxxxxxxx
```

The app will automatically use the correct key based on `EXPO_ENVIRONMENT`.

**Note:** For security, you may want to fetch the key from your backend API instead of storing it in the app.

### 4. iOS Configuration (if using prebuild)

Add URL scheme to `ios/YourApp/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>razorpay</string>
    </array>
  </dict>
</array>
```

### 5. Android Configuration (if using prebuild)

The package should auto-configure Android. If you encounter issues, check `android/app/src/main/AndroidManifest.xml`.

## Usage

The Razorpay integration is already implemented in:
- `native/src/utils/razorpay.ts` - Razorpay service
- `native/src/pages/wallet/WalletScreen.tsx` - Wallet recharge flow

## Testing

1. Use Razorpay test keys for development
2. Test with test cards provided by Razorpay
3. Verify payment success and failure flows

## Production

1. Replace test keys with production keys
2. Ensure proper error handling
3. Test thoroughly before release

## Troubleshooting

### "Razorpay SDK not available" error
- Ensure you're using a development build (not Expo Go)
- Verify `react-native-razorpay` is installed
- Rebuild the app after installing the package

### Payment not opening
- Check Razorpay key is correctly set
- Verify network connectivity
- Check Razorpay dashboard for API key status

### iOS build issues
- Ensure URL scheme is configured in Info.plist
- Run `pod install` in ios directory
- Clean build folder and rebuild

