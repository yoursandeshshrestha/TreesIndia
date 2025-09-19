import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/pages/otp_verification_page.dart';
import 'package:trees_india/commons/utils/services/navigation_service.dart';
import 'package:trees_india/pages/chats_page/domain/entities/chat_room_entity.dart';
import 'package:trees_india/pages/home_page/app/views/home_page.dart';
import 'package:trees_india/pages/login_page/app/views/login_page.dart';
import 'package:trees_india/pages/my_works_page/app/views/my_works_page.dart';
import 'package:trees_india/pages/chats_page/app/views/chats_page.dart';
import 'package:trees_india/pages/chats_page/app/views/chat_room_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_properties/app/views/my_properties_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_vendor_profiles/app/views/my_vendor_profiles_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_subscription/app/views/my_subscription_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_subscription/app/views/subscription_plans_listing_page.dart';
import 'package:trees_india/pages/welcome_page/app/views/welcome_page.dart';
import 'package:trees_india/pages/location_onboarding_page/app/views/location_onboarding_page.dart';
import 'package:trees_india/pages/manual_location_page/app/views/manual_location_page.dart';
import 'package:trees_india/pages/location_loading_page/app/views/location_loading_page.dart';
import 'package:trees_india/pages/splash_screen/app/views/splash_screen.dart';
import 'package:trees_india/pages/profile_page/app/views/profile_page.dart';
import 'package:trees_india/pages/profile_page/app/views/edit_profile_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_plans/app/views/my_plans_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/wallet/app/views/wallet_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/plus_membership/app/views/plus_membership_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_rating/app/views/my_rating_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/manage_addresses/app/views/manage_addresses_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/manage_payment_methods/app/views/manage_payment_methods_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/settings/app/views/settings_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/about_trees_india/app/views/about_trees_india_page.dart';
import 'package:trees_india/pages/services_page/app/views/services_page.dart';
import 'package:trees_india/pages/services_page/domain/entities/service_detail_entity.dart';
import 'package:trees_india/pages/services_page/app/views/service_detail_page.dart';
import 'package:trees_india/pages/search_page/app/views/search_page.dart';
import 'package:trees_india/pages/booking_page/app/views/booking_page.dart';
import 'package:trees_india/pages/bookings_page/app/views/bookings_listing_page.dart';
import 'package:trees_india/pages/rental_and_properties/app/views/rental_and_properties_page.dart';
import 'package:trees_india/commons/presenters/providers/location_onboarding_provider.dart';
import 'package:trees_india/commons/app/auth_provider.dart';
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
              onRouteChanged: (previous, current) {},
            ),
          ],
          onException: (context, state, router) {
            debugPrint('🔥 GoRouter Exception: ${state.error}');
          },
          refreshListenable: GoRouterRefreshStream(
            // Use a short-lived stream to avoid hanging if provider init is slow
            ref.watch(authProvider.notifier).authStatusStream,
          ),
          redirect: (context, state) async {
            // Custom route change logging with push/pop detection
            if (currentRoutePath != null &&
                currentRoutePath != state.fullPath) {
              // This is a push - add to stack
              if (currentRoutePath != null) {
                routeStack.add(currentRoutePath!);
              }
              debugPrint(
                  '➡️ Pushed from $currentRoutePath to ${state.fullPath}');
            } else if (currentRoutePath == null) {
              // Initial navigation
              debugPrint('🏁 Initial navigation to ${state.fullPath}');
            }
            currentRoutePath = state.fullPath;

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
                  debugPrint(
                      '✅ User authenticated, redirecting to location setup');
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
              observers: [
                NavigatorObserverWrapper(
                  onRouteChanged: (previous, current) {},
                ),
              ],
              redirect: (context, state) {
                // Custom route change logging with push/pop detection
                if (currentRoutePath != null &&
                    currentRoutePath != state.fullPath) {
                  // This is a push - add to stack
                  if (currentRoutePath != null) {
                    routeStack.add(currentRoutePath!);
                  }
                  debugPrint(
                      '➡️ Pushed from $currentRoutePath to ${state.fullPath}');
                } else if (currentRoutePath == null) {
                  // Initial navigation
                  debugPrint('🏁 Initial navigation to ${state.fullPath}');
                }
                currentRoutePath = state.fullPath;
                return null;
              },
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
                  path: '/search',
                  name: 'SearchPage',
                  builder: (context, state) => const SearchPage(),
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
                GoRoute(
                  path: '/my-plans',
                  name: 'MyPlansPage',
                  builder: (context, state) => const MyPlansPage(),
                ),
                GoRoute(
                  path: '/wallet',
                  name: 'WalletPage',
                  builder: (context, state) => const WalletPage(),
                ),
                GoRoute(
                  path: '/plus-membership',
                  name: 'PlusMembershipPage',
                  builder: (context, state) => const PlusMembershipPage(),
                ),
                GoRoute(
                  path: '/my-rating',
                  name: 'MyRatingPage',
                  builder: (context, state) => const MyRatingPage(),
                ),
                GoRoute(
                  path: '/manage-addresses',
                  name: 'ManageAddressesPage',
                  builder: (context, state) => const ManageAddressesPage(),
                ),
                GoRoute(
                  path: '/my-properties',
                  name: 'MyPropertiesPage',
                  builder: (context, state) => const MyPropertiesPage(),
                ),
                GoRoute(
                  path: '/my-vendor-profiles',
                  name: 'MyVendorProfilesPage',
                  builder: (context, state) => const MyVendorProfilesPage(),
                ),
                GoRoute(
                  path: '/my-subscription',
                  name: 'MySubscriptionPage',
                  builder: (context, state) => const MySubscriptionPage(),
                ),
                GoRoute(
                  path: '/subscription-plans',
                  name: 'SubscriptionPlansListingPage',
                  builder: (context, state) => const SubscriptionPlansListingPage(),
                ),
                GoRoute(
                  path: '/manage-payment-methods',
                  name: 'ManagePaymentMethodsPage',
                  builder: (context, state) => const ManagePaymentMethodsPage(),
                ),
                GoRoute(
                  path: '/settings',
                  name: 'SettingsPage',
                  builder: (context, state) => const SettingsPage(),
                ),
                GoRoute(
                  path: '/about-trees-india',
                  name: 'AboutTreesIndiaPage',
                  builder: (context, state) => const AboutTreesIndiaPage(),
                ),
                GoRoute(
                  path: '/services/:categoryId/:subcategoryId',
                  name: 'ServicesPage',
                  builder: (context, state) {
                    final categoryId = state.pathParameters['categoryId']!;
                    final subcategoryId =
                        state.pathParameters['subcategoryId']!;
                    return ServicesPage(
                      categoryId: categoryId,
                      subcategoryId: subcategoryId,
                    );
                  },
                ),
                GoRoute(
                  path: '/service-detail/:serviceId',
                  name: 'ServiceDetailPage',
                  builder: (context, state) {
                    final serviceData = state.extra as Map<String, dynamic>;
                    final service =
                        serviceData['service'] as ServiceDetailEntity;
                    return ServiceDetailPage(service: service);
                  },
                ),
                GoRoute(
                  path: '/bookings',
                  name: 'BookingsListingPage',
                  builder: (context, state) => const BookingsListingPage(),
                ),
                GoRoute(
                  path: '/service/:serviceId/booking',
                  name: 'BookingPage',
                  builder: (context, state) {
                    final serviceData = state.extra as Map<String, dynamic>;
                    final service =
                        serviceData['service'] as ServiceDetailEntity;
                    return BookingPage(service: service);
                  },
                ),
                GoRoute(
                  path: '/myworks',
                  name: 'MyWorksPage',
                  builder: (context, state) => const MyWorksPage(),
                ),
                GoRoute(
                  path: '/chats',
                  name: 'ChatsPage',
                  builder: (context, state) => const ChatsPage(),
                ),
                GoRoute(
                  path: '/chats/:roomId',
                  name: 'ChatRoomPage',
                  builder: (context, state) {
                    final roomId = int.parse(state.pathParameters['roomId']!);
                    final chatRoom = state.extra as ChatRoomEntity;
                    return ChatRoomPage(roomId: roomId, chatRoom: chatRoom);
                  },
                ),
                GoRoute(
                  path: '/marketplace/rental-properties',
                  name: 'RentalAndPropertiesPage',
                  builder: (context, state) => const RentalAndPropertiesPage(),
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
