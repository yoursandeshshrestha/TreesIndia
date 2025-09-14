import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';
import 'package:trees_india/commons/app/auth_provider.dart';
import 'package:trees_india/commons/app/user_profile_provider.dart';
import 'package:trees_india/commons/presenters/providers/notification_provider.dart';

final Logger _logger = Logger();

class FCMAutoRegistrationService {
  static final FCMAutoRegistrationService _instance = FCMAutoRegistrationService._internal();
  factory FCMAutoRegistrationService() => _instance;
  FCMAutoRegistrationService._internal();

  bool _isRegistrationInProgress = false;
  final Set<String> _registeredTokens = <String>{};

  /// Auto-register FCM token when conditions are met (from WidgetRef context):
  /// - User is authenticated
  /// - FCM token is available
  /// - Device is not already registered
  Future<void> autoRegisterDevice({
    WidgetRef? widgetRef,
    Ref? ref,
    required String fcmToken,
  }) async {
    // Prevent duplicate registration attempts
    if (_isRegistrationInProgress || _registeredTokens.contains(fcmToken)) {
      _logger.d('Registration already in progress or token already registered');
      return;
    }

    try {
      _isRegistrationInProgress = true;

      if (widgetRef != null) {
        await _registerWithWidgetRef(widgetRef, fcmToken);
      } else if (ref != null) {
        await _registerWithRef(ref, fcmToken);
      } else {
        throw ArgumentError('Either widgetRef or ref must be provided');
      }
      
      _logger.i('FCM auto-registration completed successfully');
    } catch (e) {
      _logger.e('Error during FCM auto-registration: $e');
    } finally {
      _isRegistrationInProgress = false;
    }
  }

  Future<void> _registerWithWidgetRef(WidgetRef ref, String fcmToken) async {
    // Check if user is authenticated
    final authState = ref.read(authProvider);
    if (!authState.isLoggedIn) {
      _logger.d('User not authenticated, skipping FCM registration');
      return;
    }

    // Get user profile to get user ID
    final userProfile = ref.read(userProfileProvider);
    if (userProfile.user?.userId == null) {
      _logger.d('User ID not available, skipping FCM registration');
      return;
    }

    final userId = userProfile.user!.userId!;
    _logger.i('Starting auto FCM registration for user $userId with token: ${fcmToken.substring(0, 20)}...');

    // Use the notification provider to handle registration
    final notificationNotifier = ref.read(notificationProvider.notifier);
    await notificationNotifier.autoRegisterIfNeeded(fcmToken, userId);

    // Mark token as registered to prevent duplicate attempts
    _registeredTokens.add(fcmToken);
  }

  Future<void> _registerWithRef(Ref ref, String fcmToken) async {
    // Check if user is authenticated
    final authState = ref.read(authProvider);
    if (!authState.isLoggedIn) {
      _logger.d('User not authenticated, skipping FCM registration');
      return;
    }

    // Get user profile to get user ID
    final userProfile = ref.read(userProfileProvider);
    if (userProfile.user?.userId == null) {
      _logger.d('User ID not available, skipping FCM registration');
      return;
    }

    final userId = userProfile.user!.userId!;
    _logger.i('Starting auto FCM registration for user $userId with token: ${fcmToken.substring(0, 20)}...');

    // Use the notification provider to handle registration
    final notificationNotifier = ref.read(notificationProvider.notifier);
    await notificationNotifier.autoRegisterIfNeeded(fcmToken, userId);

    // Mark token as registered to prevent duplicate attempts
    _registeredTokens.add(fcmToken);
  }

  /// Call this when user logs out to clear registered tokens
  void clearRegisteredTokens() {
    _registeredTokens.clear();
    _isRegistrationInProgress = false;
  }

  /// Check if a token is already registered
  bool isTokenRegistered(String token) {
    return _registeredTokens.contains(token);
  }
}

/// Convenience provider for the FCM auto-registration service
final fcmAutoRegistrationServiceProvider = Provider<FCMAutoRegistrationService>((ref) {
  return FCMAutoRegistrationService();
});