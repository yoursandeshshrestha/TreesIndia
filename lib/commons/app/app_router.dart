import 'dart:async';

import 'package:trees_india/commons/utils/services/auth_notifier.dart';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/pages/otp_verification_page.dart';
import 'package:trees_india/commons/utils/services/navigation_service.dart';
import 'package:trees_india/pages/home_page/app/views/home_page.dart';
import 'package:trees_india/pages/login_page/app/views/login_page.dart';
import 'package:trees_india/pages/register_page/app/views/register_page.dart';
import 'package:trees_india/pages/welcome_page/app/views/welcome_page.dart';
import 'package:trees_india/pages/location_onboarding_page/app/views/location_onboarding_page.dart';
import 'package:trees_india/commons/presenters/providers/location_onboarding_provider.dart';
import './route_tracker.dart';

// auth_provider.dart

class AppRouter {
  final GoRouter router;

  AppRouter(WidgetRef ref)
      : router = GoRouter(
          initialLocation: '/home',
          navigatorKey: appNavigatorKey,
          observers: [
            NavigatorObserverWrapper(
              onRouteChanged: (previous, current) {
                previousRouteName = previous?.settings.name;
                debugPrint(
                    '➡️ Moved from $previousRouteName to ${current.settings.name}');
              },
            ),
          ],
          refreshListenable: GoRouterRefreshStream(
            // Use a short-lived stream to avoid hanging if provider init is slow
            ref.watch(authProvider.notifier).authStatusStream,
          ),
          redirect: (context, state) async {
            final authState = ref.read(authProvider);
            final isAuthenticated = authState.isLoggedIn;

            debugPrint(
                '🔍 Redirect Logic: isAuthenticated=$isAuthenticated, currentPath=${state.matchedLocation}');
            debugPrint('🔍 Auth state: ${authState.toString()}');

            final isPublicRoute = state.matchedLocation == '/' ||
                state.matchedLocation == '/login' ||
                state.matchedLocation == '/signup' ||
                state.matchedLocation.startsWith('/otp-verification');

            final isLocationOnboardingRoute =
                state.matchedLocation == '/location-onboarding';

            // If user is NOT authenticated and trying to access protected route
            if (!isAuthenticated &&
                !isPublicRoute &&
                !isLocationOnboardingRoute) {
              debugPrint('🔒 User not authenticated, redirecting to /login');
              return '/login';
            }

            // If user IS authenticated, check if they need location onboarding
            if (isAuthenticated) {
              try {
                final locationService =
                    ref.read(locationOnboardingServiceProvider);
                final isFirstLogin = await locationService.isFirstLogin();

                if (isFirstLogin && !isLocationOnboardingRoute) {
                  debugPrint(
                      '🗺️ First login detected, redirecting to location onboarding');
                  return '/location-onboarding';
                }

                if (!isFirstLogin && isLocationOnboardingRoute) {
                  debugPrint('🏠 Location already set, redirecting to home');
                  return '/home';
                }

                // If user IS authenticated and on public route, go to home (unless first login)
                if (state.matchedLocation == '/' ||
                    state.matchedLocation == '/login') {
                  debugPrint('✅ User authenticated, redirecting to /home');
                  return '/home';
                }
              } catch (e) {
                debugPrint('⚠️ Error checking first login status: $e');
                // On error, allow normal flow
              }
            }

            return null;
          },
          routes: [
            // Public Routes
            GoRoute(
              path: '/',
              name: 'WelcomePage',
              builder: (context, state) => const WelcomePage(),
            ),
            GoRoute(
              path: '/signup',
              name: 'SignUpPage',
              builder: (context, state) => const SignUpPage(),
            ),
            GoRoute(
              path: '/login',
              name: 'LoginPage',
              builder: (context, state) => const LoginPage(),
            ),
            GoRoute(
              path: '/otp-verification/:phoneNumber',
              name: 'OtpVerificationPage',
              builder: (context, state) {
                final phoneNumber = state.pathParameters['phoneNumber']!;
                return OtpVerificationPage(phoneNumber: phoneNumber);
              },
            ),
            GoRoute(
              path: '/location-onboarding',
              name: 'LocationOnboardingPage',
              builder: (context, state) => const LocationOnboardingPage(),
            ),

            // Protected Routes (Requires authentication)

            ShellRoute(
              builder: (context, state, child) {
                return ProviderScope(child: Builder(
                  builder: (context) {
                    final authState = ref.read(authProvider);
                    final isAuthenticated = authState.isLoggedIn;

                    if (!isAuthenticated) {
                      debugPrint(
                          '🔒 ShellRoute: User not authenticated, showing LoginPage');
                      return const LoginPage();
                    }

                    return child;
                  },
                ));
              },
              routes: [
                GoRoute(
                  path: '/home',
                  name: 'HomePage',
                  builder: (context, state) => const HomePage(),
                ),
              ],
            ),
          ],
        );
}

// Helper class to convert StateNotifier stream to Listenable
class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen(
          (dynamic _) => notifyListeners(),
        );
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
