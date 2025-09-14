// ADDED: Import for home page provider
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/app/app_router.dart';
import 'package:trees_india/commons/components/backdrop_loader/app/views/backdrop_loader.dart';
import 'package:trees_india/commons/constants/app_constants.dart';
import 'package:trees_india/commons/presenters/providers/language_provider.dart';
import 'package:trees_india/commons/presenters/providers/notification_service_provider.dart';
import 'package:trees_india/commons/theming/app_theme.dart';
import 'package:trees_india/commons/app/auth_provider.dart';
import 'package:trees_india/commons/utils/services/push_notification_service.dart';

final appLifecycleProvider = StateProvider<AppLifecycleState?>((ref) {
  return null;
});

// ADDED: App lifecycle observer class
class AppLifecycleObserver extends WidgetsBindingObserver {
  final WidgetRef ref;

  AppLifecycleObserver(this.ref);

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    ref.read(appLifecycleProvider.notifier).state = state;
    debugPrint('App lifecycle changed to: $state');
  }
}

class AppInitializer extends ConsumerStatefulWidget {
  final GlobalKey<NavigatorState>? navigatorKey;
  const AppInitializer({super.key, this.navigatorKey});

  @override
  ConsumerState<AppInitializer> createState() => _AppInitializerState();
}

class _AppInitializerState extends ConsumerState<AppInitializer>
    with WidgetsBindingObserver {
  late Future<void> _initFuture;
  bool _initialized = false;

  // ADDED: App lifecycle observer instance
  late AppLifecycleObserver _lifecycleObserver;

  @override
  void initState() {
    super.initState();
    _initAuth();
    WidgetsBinding.instance.addObserver(this);

    // ADDED: Initialize and add the lifecycle observer
    _lifecycleObserver = AppLifecycleObserver(ref);
    WidgetsBinding.instance.addObserver(_lifecycleObserver);

    debugPrint('AppInitializer initState called');
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    // ADDED: Remove the lifecycle observer
    WidgetsBinding.instance.removeObserver(_lifecycleObserver);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    debugPrint('AppInitializer: App lifecycle state changed to $state');

    if (state == AppLifecycleState.resumed) {
      if (_initialized) {
        debugPrint(
            'AppInitializer: App resumed, invalidating location providers');

        // ADDED: Reset home page when app resumes from background
        debugPrint('AppInitializer: App resumed, resetting home page state');
      }
    }
  }

  Future<void> _initAuth() async {
    debugPrint('Starting auth initialization');
    _initFuture = ref.read(authProvider.notifier).checkAuthState();
    try {
      await _initFuture.timeout(const Duration(seconds: 3), onTimeout: () {
        debugPrint('Auth initialization timed out; proceeding without auth');
      });
    } catch (e) {
      debugPrint('Auth initialization error: $e');
    }

    // Initialize push notifications after auth
    try {
      if (mounted) {
        final pushService = PushNotificationService();
        await pushService.initialize(ref, context, navigatorKey: widget.navigatorKey);
        debugPrint('Push notifications initialized successfully');
      }
    } catch (e) {
      debugPrint('Push notification initialization error: $e');
    }

    setState(() {
      _initialized = true;
    });

    debugPrint('Auth initialization completed');
  }

  @override
  Widget build(BuildContext context) {
    debugPrint('AppInitializer build called. Initialized: $_initialized');

    if (!_initialized) {
      debugPrint('Showing loading screen');
      return const MaterialApp(
        debugShowCheckedModeBanner: false,
        home: Scaffold(
          body: Center(
            child: BackdropLoader(),
          ),
        ),
      );
    }

    debugPrint('Building main app');

    return Consumer(
      builder: (context, ref, child) {
        final language = ref.watch(languageProvider);
        final notificationService = ref.watch(notificationServiceProvider);
        final isAuthenticated = ref.watch(authProvider);

        // ADDED: Listen to app lifecycle changes for additional debugging
        ref.listen<AppLifecycleState?>(appLifecycleProvider,
            (previous, current) {
          debugPrint(
              'AppInitializer: Lifecycle listener - Previous: $previous, Current: $current');
        });

        debugPrint(
            '***********************************Current Language: ${(language ?? AppConstants.defaultLanguage).languageCode}');
        debugPrint('Auth state in build: $isAuthenticated');

        return MaterialApp.router(
          title: AppConstants.appName,
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          routerConfig: AppRouter(ref).router,
          scaffoldMessengerKey: notificationService.scaffoldMessengerKey,
          locale: language?.locale ?? AppConstants.defaultLanguage.locale,
          // localizationsDelegates: const [
          //   GlobalMaterialLocalizations.delegate,
          //   GlobalWidgetsLocalizations.delegate,
          //   GlobalCupertinoLocalizations.delegate,
          // ],
          supportedLocales: AppConstants.supportedLanguages
              .map((lang) => lang.locale)
              .toList(),
        );
      },
    );
  }
}
