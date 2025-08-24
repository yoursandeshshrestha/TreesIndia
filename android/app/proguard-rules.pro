# Flutter specific rules
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Razorpay specific rules
-keep class com.razorpay.** { *; }
-keep class proguard.annotation.** { *; }
-dontwarn proguard.annotation.**

# ProGuard annotation classes (missing classes fix)
-dontwarn proguard.annotation.Keep
-dontwarn proguard.annotation.KeepClassMembers

# Keep all classes that use ProGuard annotations
-keep @proguard.annotation.Keep class *
-keepclassmembers class * {
    @proguard.annotation.Keep *;
}

# Additional rules for Razorpay dependencies
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Gson specific rules (if used by Razorpay)
-keepattributes Signature
-keepattributes *Annotation*
-dontwarn sun.misc.**

# OkHttp rules (if used)
-dontwarn okhttp3.**
-dontwarn okio.**

# Google Play Core and Services rules
-dontwarn com.google.android.play.core.**
-dontwarn com.google.android.apps.nbu.paisa.inapp.client.api.**
-keep class com.google.android.play.core.** { *; }
-keep class com.google.android.apps.nbu.paisa.inapp.client.api.** { *; }

# Flutter Play Store Split Compatibility
-dontwarn io.flutter.embedding.android.FlutterPlayStoreSplitApplication
-keep class io.flutter.embedding.android.FlutterPlayStoreSplitApplication { *; }

# Additional Google Play services rules
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**