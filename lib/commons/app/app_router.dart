import 'dart:async';

import 'package:trees_india/commons/utils/services/auth_notifier.dart';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/pages/otp_verification_page.dart';
import 'package:trees_india/commons/utils/services/navigation_service.dart';
import 'package:trees_india/pages/home_page/app/views/home_page.dart';
import 'package:trees_india/pages/login_page/app/views/login_page.dart';
import 'package:trees_india/pages/welcome_page/app/views/welcome_page.dart';
import 'package:trees_india/pages/location_onboarding_page/app/views/location_onboarding_page.dart';
import 'package:trees_india/pages/manual_location_page/app/views/manual_location_page.dart';
import 'package:trees_india/pages/location_loading_page/app/views/location_loading_page.dart';
import 'package:trees_india/pages/splash_screen/app/views/splash_screen.dart';
import 'package:trees_india/pages/profile_page/app/views/profile_page.dart';
import 'package:trees_india/pages/profile_page/app/views/edit_profile_page.dart';
import 'package:trees_india/commons/presenters/providers/location_onboarding_provider.dart';
import './route_tracker.dart';

// auth_provider.dart

class AppRouter {
  final GoRouter router;

  AppRouter(WidgetRef ref)
      : router = GoRouter(
          initialLocation: '/',
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
            debugPrint(
                '🔍 Router redirect called for path: ${state.matchedLocation}');
            final authState = ref.read(authProvider);
            final isAuthenticated = authState.isLoggedIn;

            debugPrint(
                '🔍 Redirect Logic: isAuthenticated=$isAuthenticated, currentPath=${state.matchedLocation}');
            debugPrint('🔍 Auth state: ${authState.toString()}');

            final isPublicRoute = state.matchedLocation == '/' ||
                state.matchedLocation == '/welcome' ||
                state.matchedLocation == '/login' ||
                state.matchedLocation.startsWith('/otp-verification');

            final isLocationFlowRoute =
                state.matchedLocation == '/location-onboarding' ||
                    state.matchedLocation == '/manual-location' ||
                    state.matchedLocation == '/location-loading';

            // If user is NOT authenticated and trying to access protected route
            if (!isAuthenticated && !isPublicRoute && !isLocationFlowRoute) {
              debugPrint('🔒 User not authenticated, redirecting to /login');
              return '/login';
            }

            // If user IS authenticated, check if they need location onboarding
            if (isAuthenticated) {
              try {
                final locationService =
                    ref.read(locationOnboardingServiceProvider);
                final isFirstLogin = await locationService.isFirstLogin();

                if (isFirstLogin && !isLocationFlowRoute) {
                  debugPrint(
                      '🗺️ First login detected, redirecting to location onboarding');
                  return '/location-onboarding';
                }

                // Allow access to location onboarding if user explicitly navigates there
                // (removed automatic redirect to home for non-first-login users)

                // If user IS authenticated and on public route, go to location loading
                if (isPublicRoute) {
                  debugPrint('✅ User authenticated, redirecting to location setup');
                  return '/location-loading';
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
              name: 'SplashScreen',
              builder: (context, state) => const SplashScreen(),
            ),
            GoRoute(
              path: '/welcome',
              name: 'WelcomePage',
              builder: (context, state) => const WelcomePage(),
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
            GoRoute(
              path: '/manual-location',
              name: 'ManualLocationPage',
              builder: (context, state) => const ManualLocationPage(),
            ),
            GoRoute(
              path: '/location-loading',
              name: 'LocationLoadingPage',
              builder: (context, state) => const LocationLoadingPage(),
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
                GoRoute(
                  path: '/profile',
                  name: 'ProfilePage',
                  builder: (context, state) => const ProfilePage(),
                ),
                GoRoute(
                  path: '/edit-profile',
                  name: 'EditProfilePage',
                  builder: (context, state) => const EditProfilePage(),
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
