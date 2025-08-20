import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:device_info_plus/device_info_plus.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../presenters/providers/local_storage_provider.dart';
import 'centralized_local_storage_service.dart';

const bool _debugNotifications = true;
const bool _debugNotificationTaps = true; // Specific for tap events
const bool _debugNavigation = true;

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Don't call Firebase.initializeApp() here as it should already be initialized
  if (_debugNotifications) {
    debugPrint('📱 Handling background message: ${message.messageId}');
    debugPrint('📱 Background message data: ${message.data}');
  }
}

@pragma('vm:entry-point')
void notificationTapBackground(NotificationResponse notificationResponse) {
  if (_debugNotificationTaps) {
    debugPrint('📱 BACKGROUND TAP HANDLER TRIGGERED');
    debugPrint('📱 Notification payload: ${notificationResponse.payload}');
  }
  // The app will handle this when it resumes
}

late CentralizedLocalStorageService _localStorage;
late WidgetRef _ref;
GlobalKey<NavigatorState>? _navigatorKey;

class PushNotificationService {
  static final PushNotificationService _instance =
      PushNotificationService._internal();
  factory PushNotificationService() => _instance;
  PushNotificationService._internal();
  // bool _isInitialized = false;

  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();
  // bool _isInitialized = false;

  Future<void> initialize(WidgetRef ref, BuildContext context,
      {GlobalKey<NavigatorState>? navigatorKey}) async {
    try {
      _ref = ref;
      _navigatorKey = navigatorKey;

      if (_debugNotifications) {
        debugPrint('📱 Initializing PushNotificationService');
      }

      // Request permission first and check the status
      NotificationSettings settings =
          await _firebaseMessaging.requestPermission(
        alert: true,
        sound: true,
        badge: true,
      );

      if (settings.authorizationStatus != AuthorizationStatus.authorized) {
        if (_debugNotifications) {
          debugPrint('📱 User declined push notifications');
        }
        return;
      }

      // Set background message handler
      FirebaseMessaging.onBackgroundMessage(
          _firebaseMessagingBackgroundHandler);

      // Initialize local notifications
      const androidSettings =
          AndroidInitializationSettings('@mipmap/ic_launcher');
      const iosSettings = DarwinInitializationSettings(
        requestSoundPermission: true,
        requestBadgePermission: true,
        requestAlertPermission: true,
      );

      // Initialize local notifications with proper callback handling
      await _localNotifications.initialize(
        const InitializationSettings(
            android: androidSettings, iOS: iosSettings),
        onDidReceiveNotificationResponse: _handleNotificationResponse,
        onDidReceiveBackgroundNotificationResponse: notificationTapBackground,
      );

      if (_debugNotifications) {
        debugPrint('📱 Notification tap handler registered successfully');
      }

      // Create notification channel for Android
      final AndroidFlutterLocalNotificationsPlugin? androidPlugin =
          _localNotifications.resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>();

      if (androidPlugin != null) {
        await androidPlugin.createNotificationChannel(
            const AndroidNotificationChannel(
                'treesindia_channel', 'treesIndia Notifications',
                importance: Importance.high));

        // Set notification callback for Android
        await androidPlugin.requestNotificationsPermission();
      }

      // Check for initial message that might have opened the app
      await _checkInitialNotifications(context);

      // Get FCM token with timeout and error handling
      try {
        final token = await _firebaseMessaging.getToken().timeout(
          const Duration(seconds: 10),
          onTimeout: () {
            throw TimeoutException('Failed to get FCM token');
          },
        );

        if (token != null) {
          _localStorage = ref.watch(localStorageServiceProvider);
          await _localStorage.saveData('FCMTOKEN', token);
          debugPrint('FCM Token: $token');
        } else {
          debugPrint('FCM token is null');
        }
      } catch (e) {
        debugPrint('Error getting FCM token: $e');
      }

      // _isInitialized = true;
    } catch (e, stackTrace) {
      debugPrint('Error initializing push notifications: $e');
      debugPrint('Stack trace: $stackTrace');
    }
  }

  static Future<void> enablePushNotifications(
      WidgetRef ref, BuildContext context) async {
    if (Platform.isAndroid) {
      final androidInfo = await DeviceInfoPlugin().androidInfo;
      if (androidInfo.version.sdkInt >= 33) {
        // For Android 13+
        final status = await Permission.notification.request();
        print('Notification permission status: $status');
      }
    }
    await PushNotificationService().initialize(ref, context);
  }

  void _handleNotificationResponse(NotificationResponse response) {
    if (_debugNotificationTaps) {
      debugPrint('📱 FOREGROUND NOTIFICATION TAP HANDLER TRIGGERED');
      debugPrint('📱 Notification payload: ${response.payload}');
      debugPrint('📱 Notification ID: ${response.id}');
      debugPrint('📱 Notification action ID: ${response.actionId}');
      debugPrint('📱 Notification input: ${response.input}');
    }

    // Use a delayed callback to ensure app is fully ready
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_navigatorKey?.currentContext != null) {
        _onNotificationTapped(response, _navigatorKey!.currentContext!);
      } else {
        if (_debugNotificationTaps) {
          debugPrint('📱 No valid context available, delaying tap handling');
        }
        // Retry with longer delay if context isn't available yet
        Future.delayed(const Duration(milliseconds: 1000), () {
          if (_navigatorKey?.currentContext != null) {
            _onNotificationTapped(response, _navigatorKey!.currentContext!);
          } else {
            if (_debugNotificationTaps) {
              debugPrint('📱 Still no valid context after delay');
            }
          }
        });
      }
    });
  }

  Future<void> _checkInitialNotifications(BuildContext context) async {
    try {
      // Check for notification that launched the app
      final notificationAppLaunchDetails =
          await _localNotifications.getNotificationAppLaunchDetails();

      if (notificationAppLaunchDetails != null &&
          notificationAppLaunchDetails.didNotificationLaunchApp &&
          notificationAppLaunchDetails.notificationResponse != null) {
        if (_debugNotifications) {
          debugPrint(
              '📱 App was launched by notification during initialization');
          debugPrint(
              '📱 Notification details: ${notificationAppLaunchDetails.notificationResponse}');
        }

        // Use a delayed callback to ensure app is ready
        Future.delayed(const Duration(milliseconds: 1000), () {
          if (notificationAppLaunchDetails.notificationResponse != null) {
            _onNotificationTapped(
                notificationAppLaunchDetails.notificationResponse!,
                _navigatorKey?.currentContext ?? context);
          }
        });
      }

      // Also check for FCM initial message
      RemoteMessage? initialMessage =
          await _firebaseMessaging.getInitialMessage();
      if (initialMessage != null) {
        if (_debugNotifications) {
          debugPrint(
              '📱 App opened from terminated state via FCM notification');
        }
        // Delayed to ensure app is initialized
        Future.delayed(const Duration(milliseconds: 1000), () {
          _handleBackgroundNotificationTap(initialMessage, _ref, context);
        });
      }

      // Set up listeners for FCM messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        if (Platform.isIOS) {
          // Custom iOS foreground handling
          _handleIOSForegroundMessage(message);
        } else {
          // Existing Android handling
          _handleForegroundMessage(context, message);
        }
      });
      FirebaseMessaging.onMessageOpenedApp.listen((message) {
        if (_debugNotifications) {
          debugPrint(
              '📱 App opened from background state via FCM notification');
        }
        _handleBackgroundNotificationTap(message, _ref, context);
      });
    } catch (e) {
      if (_debugNotifications) {
        debugPrint('📱 Error checking initial notifications: $e');
      }
    }
  }

  void _handleIOSForegroundMessage(RemoteMessage message) {
    // iOS-specific foreground notification handling
    final notification = message.notification;
    final data = message.data;

    if (notification != null) {
      // Use local notifications plugin for iOS foreground notifications
      _localNotifications.show(
        DateTime.now().millisecondsSinceEpoch ~/ 1000,
        notification.title ?? 'treesIndia Notification',
        notification.body ?? '',
        const NotificationDetails(
          iOS: DarwinNotificationDetails(
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          ),
        ),
        payload: json.encode(data),
      );
    }
  }

  Future<void> _handleForegroundMessage(
      BuildContext context, RemoteMessage message) async {
    try {
      final data = message.data;

      String? title = message.notification?.title;
      String? body = message.notification?.body;

      if (title == null || title.isEmpty) {
        title = data['gcm.notification.title'] ??
            data['title'] ??
            'treesIndia Notification';
      }

      if (body == null || body.isEmpty) {
        body = data['gcm.notification.body'] ?? data['body'] ?? '';
      }

      String payload = '';
      if (data.containsKey('DocumentName') &&
          data.containsKey('WorkflowID') &&
          data.containsKey('WorkflowType') &&
          data.containsKey('TemplateId') &&
          data.containsKey('DocumentExpiry')) {
        debugPrint('Foreground message data: $data');
        await _localStorage.saveData(
            'CURRENTSUBSCRIBERID', data['DocumentExpiry']);
        await _localStorage.saveData('WORKFLOWID', data['WorkflowID']);
        await _localStorage.saveData('TEMPLATEID', data['TemplateId']);
        payload =
            '${data['DocumentName']}|${data['WorkflowID']}|${data['WorkflowType']}|${data['TemplateId']} |${data['DocumentExpiry']}';
      } else {
        // Try alternative keys (lowercase or different format)
        final docName = data['DocumentName'] ??
            data['documentName'] ??
            data['document_name'] ??
            '';
        final workflowId = data['WorkflowID'] ??
            data['workflowId'] ??
            data['workflow_id'] ??
            '';
        final workflowType = data['WorkflowType'] ??
            data['workflowType'] ??
            data['workflow_type'] ??
            '';
        final templateId = data['TemplateId'] ??
            data['templateId'] ??
            data['template_id'] ??
            '';
        // final currentSubscriberId = data['CurrentSubscriberId'] ?? data['currentSubscriberId'] ?? data['current_subscriber_id'] ?? '';

        await _localStorage.saveData('WORKFLOWID', workflowId);

        payload = '$docName|$workflowId|$workflowType|$templateId';
      }

      if (_debugNotifications) {
        debugPrint('📱 Showing notification with title: $title');
        debugPrint('📱 Notification body: $body');
        debugPrint('📱 Notification payload: $payload');
        // debugPrint('Notific')
      }
      final notificationId = DateTime.now().millisecondsSinceEpoch ~/ 1000;
      await _localNotifications.show(
        notificationId,
        title,
        body,
        const NotificationDetails(
          android: AndroidNotificationDetails(
              'treesindia_channel', 'treesIndia Notification',
              channelDescription: 'Notifications for treesIndia app',
              importance: Importance.high,
              priority: Priority.high,
              showWhen: true,
              enableLights: true,
              enableVibration: true,
              playSound: true,
              icon: '@mipmap/ic_launcher'),
          iOS: DarwinNotificationDetails(
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          ),
        ),
        payload: payload,
      );
    } catch (e) {
      if (_debugNotifications) {
        debugPrint('📱 Error handling foreground message: $e');
      }
    }
  }

  // Rest of your methods remain the same
  void _handleBackgroundNotificationTap(
      RemoteMessage message, WidgetRef ref, BuildContext context) {
    final data = message.data;

    if (_debugNotifications) {
      debugPrint('📱 Background notification tapped with data: $data');
    }

    // Prepare the payload for navigation
    String payload = '';
    if (data.containsKey('DocumentName') &&
        data.containsKey('WorkflowID') &&
        data.containsKey('WorkflowType') &&
        data.containsKey('TemplateId')) {
      payload =
          '${data['DocumentName']}|${data['WorkflowID']}|${data['WorkflowType']}|${data['TemplateId']}';
    } else {
      // Try alternative keys (lowercase or different format)
      final docName = data['DocumentName'] ??
          data['documentName'] ??
          data['document_name'] ??
          '';
      final workflowId =
          data['WorkflowID'] ?? data['workflowId'] ?? data['workflow_id'] ?? '';
      final workflowType = data['WorkflowType'] ??
          data['workflowType'] ??
          data['workflow_type'] ??
          '';
      final templateId =
          data['TemplateId'] ?? data['templateId'] ?? data['template_id'] ?? '';

      payload = '$docName|$workflowId|$workflowType|$templateId';
    }
    _navigateToDocument(context, payload);
  }

  void _onNotificationTapped(
      NotificationResponse response, BuildContext context) {
    try {
      if (_debugNotificationTaps) {
        debugPrint('📱 NOTIFICATION TAP HANDLER CALLED');
        debugPrint('📱 Notification payload: ${response.payload}');
      }

      if (response.payload == null || response.payload!.isEmpty) {
        if (_debugNotificationTaps) {
          debugPrint('📱 Warning: Notification payload is null or empty');
        }
        return;
      }

      // Important: Use runZonedGuarded to catch any errors during navigation
      runZonedGuarded(() {
        if (context.mounted) {
          _navigateToDocument(context, response.payload!);
        } else {
          if (_debugNotificationTaps) {
            debugPrint('📱 Context is not mounted, cannot navigate');
          }
        }
      }, (error, stack) {
        if (_debugNotificationTaps) {
          debugPrint('📱 Error during notification navigation: $error');
          debugPrint('📱 Stack trace: $stack');
        }
      });
    } catch (e, stackTrace) {
      if (_debugNotificationTaps) {
        debugPrint('📱 CRITICAL ERROR in _onNotificationTapped: $e');
        debugPrint('📱 Stack trace: $stackTrace');
      }
    }
  }

  Future<void> checkForPendingNotifications(BuildContext context) async {
    try {
      if (_debugNotifications) {
        debugPrint('📱 Checking for pending notifications at startup');
      }

      // Check for notification that launched the app
      final notificationAppLaunchDetails =
          await _localNotifications.getNotificationAppLaunchDetails();

      if (notificationAppLaunchDetails != null &&
          notificationAppLaunchDetails.didNotificationLaunchApp) {
        if (_debugNotifications) {
          debugPrint('📱 App was launched by notification');
          debugPrint(
              '📱 Notification details: ${notificationAppLaunchDetails.notificationResponse}');
        }

        // Add delay to ensure app is fully initialized
        Future.delayed(const Duration(milliseconds: 500), () {
          if (notificationAppLaunchDetails.notificationResponse != null) {
            // Use provided context instead of navigator key context initially
            _onNotificationTapped(
                notificationAppLaunchDetails.notificationResponse!, context);
          }
        });
      }
    } catch (e) {
      if (_debugNotifications) {
        debugPrint('📱 Error checking pending notifications: $e');
      }
    }
  }

  void _navigateToDocument(BuildContext context, String payload) {
    try {
      if (_debugNavigation) {
        debugPrint('📱 NAVIGATION ATTEMPT');
        debugPrint('📱 Payload: $payload');
        debugPrint('📱 Context mounted: ${context.mounted}');
      }

      if (!context.mounted) {
        if (_debugNavigation) {
          debugPrint('📱 Context is not mounted, cannot navigate');
        }
        return;
      }

      final parts = payload.split('|');

      if (parts.isEmpty || parts.length < 4) {
        if (_debugNavigation) {
          debugPrint('📱 Error: Invalid payload format: $payload');
        }
        return;
      }

      final documentData = {
        'documentName': parts[0],
        'workflowId': parts[1],
        'workflowType': parts[2],
        'templateId': parts[3],
      };

      if (_debugNavigation) debugPrint('📱 Document data: $documentData');

      // Use a flag to prevent duplicate navigation

      // Ensure we have a valid navigation context and we're on the UI thread
    } catch (e, stackTrace) {
      if (_debugNavigation) {
        debugPrint('📱 CRITICAL ERROR in _navigateToDocument: $e');
        debugPrint('📱 Stack trace: $stackTrace');
      }
    }
  }
}
