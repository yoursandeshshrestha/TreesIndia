import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/app/auth_provider.dart';
import 'package:trees_india/commons/pages/otp_verification_page.dart';
import 'package:trees_india/commons/presenters/providers/location_onboarding_provider.dart';
import 'package:trees_india/commons/utils/services/navigation_service.dart';
import 'package:trees_india/pages/booking_page/app/views/booking_page.dart';
import 'package:trees_india/pages/bookings_page/app/views/bookings_listing_page.dart';
import 'package:trees_india/pages/chats_page/app/views/conversation_page.dart';
import 'package:trees_india/pages/chats_page/app/views/conversations_page.dart';

import 'package:trees_india/pages/home_page/app/views/home_page.dart';
import 'package:trees_india/pages/location_loading_page/app/views/location_loading_page.dart';
import 'package:trees_india/pages/location_onboarding_page/app/views/location_onboarding_page.dart';
import 'package:trees_india/pages/login_page/app/views/login_page.dart';
import 'package:trees_india/pages/manual_location_page/app/views/manual_location_page.dart';
import 'package:trees_india/pages/marketplace_projects/app/views/marketplace_projects_page.dart';
import 'package:trees_india/pages/marketplace_projects/app/views/project_details_page.dart';
import 'package:trees_india/pages/marketplace_vendors/app/views/marketplace_vendors_page.dart';
import 'package:trees_india/pages/marketplace_vendors/app/views/vendor_details_page.dart';
import 'package:trees_india/pages/marketplace_workers/app/views/marketplace_workers_page.dart';
import 'package:trees_india/pages/marketplace_workers/app/views/worker_details_page.dart';
import 'package:trees_india/pages/my_works_page/app/views/my_works_page.dart';
import 'package:trees_india/pages/notifications_page/app/views/notifications_page.dart';
import 'package:trees_india/pages/profile_page/app/views/edit_profile_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/about_trees_india/app/views/about_trees_india_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/broker_application/app/views/broker_application_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/manage_addresses/app/views/manage_addresses_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_properties/app/views/my_properties_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_subscription/app/views/my_subscription_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_subscription/app/views/subscription_plans_listing_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_vendor_profiles/app/views/my_vendor_profiles_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/settings/app/views/settings_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/wallet/app/views/wallet_page.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/app/views/worker_application_page.dart';
import 'package:trees_india/pages/profile_page/app/views/profile_page.dart';
import 'package:trees_india/pages/rental_and_properties/app/views/property_details_page.dart';
import 'package:trees_india/pages/rental_and_properties/app/views/rental_and_properties_page.dart';
import 'package:trees_india/pages/search_page/app/views/search_page.dart';
import 'package:trees_india/pages/services_page/app/views/service_detail_page.dart';
import 'package:trees_india/pages/services_page/app/views/services_page.dart';
import 'package:trees_india/pages/services_page/domain/entities/service_detail_entity.dart';
import 'package:trees_india/pages/splash_screen/app/views/splash_screen.dart';

import 'package:trees_india/commons/components/snackbar/custom_exit_snackbar.dart';

import './route_tracker.dart';

// Base route widget - invisible foundation for navigation stack
class BaseRouteWidget extends StatefulWidget {
  const BaseRouteWidget({super.key});

  @override
  State<BaseRouteWidget> createState() => _BaseRouteWidgetState();
}

class _BaseRouteWidgetState extends State<BaseRouteWidget> {
  @override
  void initState() {
    super.initState();

    // This should never be visible - immediately redirect to home
    WidgetsBinding.instance.addPostFrameCallback((_) {
      debugPrint('AppRouter: 📍 BaseRouteWidget redirecting to /home');
      context.go('/location-loading');
    });
  }

  @override
  Widget build(BuildContext context) {
    return const SizedBox.shrink(); // Empty widget
  }
}

// Custom back button handler for main pages
class MainPageWrapper extends StatefulWidget {
  final Widget child;
  final String routePath;

  const MainPageWrapper({
    super.key,
    required this.child,
    required this.routePath,
  });

  @override
  State<MainPageWrapper> createState() => _MainPageWrapperState();
}

class _MainPageWrapperState extends State<MainPageWrapper> {
  DateTime? _lastBackPressTime;
  Timer? _exitTimer;

  @override
  void initState() {
    super.initState();
    debugPrint(
        'AppRouter: 🔙 MainPageWrapper initialized for ${widget.routePath}');
  }

  @override
  void dispose() {
    _exitTimer?.cancel();
    super.dispose();
  }

  void _handleMainPageBackPress() {
    final now = DateTime.now();
    debugPrint(
        'AppRouter: 🔄 HandleMainPageBackPress called for ${widget.routePath}. _lastBackPressTime: $_lastBackPressTime');

    if (_lastBackPressTime == null ||
        now.difference(_lastBackPressTime!) > const Duration(seconds: 2)) {
      _lastBackPressTime = now;

      ScaffoldMessenger.of(context).showSnackBar(
        CustomExitSnackbar.create(),
      );

      _exitTimer?.cancel();
      _exitTimer = Timer(const Duration(seconds: 2), () {
        if (mounted) {
          debugPrint(
              'AppRouter: ⏰ Timer expired - resetting exit state for ${widget.routePath}');
          _lastBackPressTime = null;
        }
      });
    } else {
      debugPrint(
          'AppRouter: 🚪 Second press within 2s from ${widget.routePath} - allowing exit');
      _exitTimer?.cancel();
      SystemNavigator.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false, // We'll handle all back button presses ourselves
      onPopInvokedWithResult: (bool didPop, dynamic result) {
        debugPrint(
            'AppRouter: 🔙 PopScope triggered for ${widget.routePath}! didPop: $didPop');

        if (!didPop) {
          // Apply double-tap-to-exit behavior to all main pages
          _handleMainPageBackPress();
        }
      },
      child: widget.child,
    );
  }
}

// auth_provider.dart

// Fade transition builder
Widget _fadeTransition(BuildContext context, Animation<double> animation,
    Animation<double> secondaryAnimation, Widget child) {
  return FadeTransition(
    opacity: animation,
    child: child,
  );
}

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

                // If user IS authenticated and on public route, go to base route (which will redirect to home)
                if (isPublicRoute) {
                  debugPrint('✅ User authenticated, redirecting to base route');
                  return '/base';
                }
              } catch (e) {
                debugPrint('⚠️ Error checking first login status: $e');
                // On error, allow normal flow
              }
            }

            return null;
          },
          routes: [
            // Hidden base route to create navigation stack foundation
            GoRoute(
              path: '/base',
              name: 'BaseRoute',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const BaseRouteWidget(),
                transitionsBuilder: _fadeTransition,
              ),
            ),

            // Public Routes
            GoRoute(
              path: '/',
              name: 'SplashScreen',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const SplashScreen(),
                transitionsBuilder: _fadeTransition,
              ),
            ),

            GoRoute(
              path: '/login',
              name: 'LoginPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const LoginPage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/otp-verification/:phoneNumber',
              name: 'OtpVerificationPage',
              pageBuilder: (context, state) {
                final phoneNumber = state.pathParameters['phoneNumber']!;
                return CustomTransitionPage(
                  key: state.pageKey,
                  child: OtpVerificationPage(phoneNumber: phoneNumber),
                  transitionsBuilder: _fadeTransition,
                );
              },
            ),
            GoRoute(
              path: '/location-onboarding',
              name: 'LocationOnboardingPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const LocationOnboardingPage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/manual-location',
              name: 'ManualLocationPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const ManualLocationPage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/location-loading',
              name: 'LocationLoadingPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const LocationLoadingPage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),

            // Protected Routes (Requires authentication) - converted from ShellRoute
            GoRoute(
              path: '/home',
              name: 'HomePage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const MainPageWrapper(
                  routePath: '/home',
                  child: HomePage(),
                ),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/search',
              name: 'SearchPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const SearchPage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/profile',
              name: 'ProfilePage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const MainPageWrapper(
                  routePath: '/profile',
                  child: ProfilePage(),
                ),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/edit-profile',
              name: 'EditProfilePage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const EditProfilePage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),

            GoRoute(
              path: '/wallet',
              name: 'WalletPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const WalletPage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),

            GoRoute(
              path: '/manage-addresses',
              name: 'ManageAddressesPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const ManageAddressesPage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/my-properties',
              name: 'MyPropertiesPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const MyPropertiesPage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/my-vendor-profiles',
              name: 'MyVendorProfilesPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const MyVendorProfilesPage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/worker-application',
              name: 'WorkerApplicationPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const WorkerApplicationPage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/broker-application',
              name: 'BrokerApplicationPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const BrokerApplicationPage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/my-subscription',
              name: 'MySubscriptionPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const MySubscriptionPage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/subscription-plans',
              name: 'SubscriptionPlansListingPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const SubscriptionPlansListingPage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),

            GoRoute(
              path: '/settings',
              name: 'SettingsPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const SettingsPage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/about-trees-india',
              name: 'AboutTreesIndiaPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const AboutTreesIndiaPage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/services',
              // path: '/services?:categoryId/:subcategoryId',
              name: 'ServicesPage',
              pageBuilder: (context, state) {
                final categoryId = state.uri.queryParameters['category'];
                final subcategoryId = state.uri.queryParameters['subcategory'];
                return CustomTransitionPage(
                  key: state.pageKey,
                  child: ServicesPage(
                    categoryId: categoryId,
                    subcategoryId: subcategoryId,
                  ),
                  transitionsBuilder: _fadeTransition,
                );
              },
            ),
            GoRoute(
              path: '/service-detail/:serviceId',
              name: 'ServiceDetailPage',
              pageBuilder: (context, state) {
                final serviceData = state.extra as Map<String, dynamic>;
                final service = serviceData['service'] as ServiceDetailEntity;
                return CustomTransitionPage(
                  key: state.pageKey,
                  child: ServiceDetailPage(service: service),
                  transitionsBuilder: _fadeTransition,
                );
              },
            ),
            GoRoute(
              path: '/bookings',
              name: 'BookingsListingPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const MainPageWrapper(
                  routePath: '/bookings',
                  child: BookingsListingPage(),
                ),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/service/:serviceId/booking',
              name: 'BookingPage',
              pageBuilder: (context, state) {
                final serviceData = state.extra as Map<String, dynamic>;
                final service = serviceData['service'] as ServiceDetailEntity;
                return CustomTransitionPage(
                  key: state.pageKey,
                  child: BookingPage(service: service),
                  transitionsBuilder: _fadeTransition,
                );
              },
            ),
            GoRoute(
              path: '/myworks',
              name: 'MyWorksPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const MainPageWrapper(
                  routePath: '/myworks',
                  child: MyWorksPage(),
                ),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/conversations',
              name: 'ConversationsPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const MainPageWrapper(
                  routePath: '/conversations',
                  child: ConversationsPage(),
                ),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/conversations/:conversationId',
              name: 'ConversationPage',
              pageBuilder: (context, state) {
                final conversationId =
                    int.parse(state.pathParameters['conversationId']!);
                return CustomTransitionPage(
                  key: state.pageKey,
                  child: ConversationPage(
                    conversationId: conversationId,
                  ),
                  transitionsBuilder: _fadeTransition,
                );
              },
            ),
            GoRoute(
              path: '/marketplace/rental-properties',
              name: 'RentalAndPropertiesPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const RentalAndPropertiesPage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/rental-properties/:propertyId',
              name: 'PropertyDetailsPage',
              pageBuilder: (context, state) {
                final propertyId = state.pathParameters['propertyId']!;
                return CustomTransitionPage(
                  key: state.pageKey,
                  child: PropertyDetailsPage(propertyId: propertyId),
                  transitionsBuilder: _fadeTransition,
                );
              },
            ),
            GoRoute(
              path: '/marketplace/projects',
              name: 'ProjectsPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const MarketplaceProjectsPage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/projects/:projectId',
              name: 'ProjectDetailsPage',
              pageBuilder: (context, state) {
                final projectId = state.pathParameters['projectId']!;
                return CustomTransitionPage(
                  key: state.pageKey,
                  child: ProjectDetailsPage(projectId: projectId),
                  transitionsBuilder: _fadeTransition,
                );
              },
            ),
            GoRoute(
              path: '/marketplace/vendors',
              name: 'VendorsPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const MarketplaceVendorsPage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/vendors/:vendorId',
              name: 'VendorDetailsPage',
              pageBuilder: (context, state) {
                final vendorId = state.pathParameters['vendorId']!;
                return CustomTransitionPage(
                  key: state.pageKey,
                  child: VendorDetailsPage(vendorId: vendorId),
                  transitionsBuilder: _fadeTransition,
                );
              },
            ),
            GoRoute(
              path: '/marketplace/workers',
              name: 'WorkersPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const MarketplaceWorkersPage(),
                transitionsBuilder: _fadeTransition,
              ),
            ),
            GoRoute(
              path: '/workers/:workerId',
              name: 'WorkerDetailsPage',
              pageBuilder: (context, state) {
                final workerId = state.pathParameters['workerId']!;
                return CustomTransitionPage(
                  key: state.pageKey,
                  child: WorkerDetailsPage(workerId: workerId),
                  transitionsBuilder: _fadeTransition,
                );
              },
            ),
            GoRoute(
              path: '/notifications',
              name: 'NotificationsPage',
              pageBuilder: (context, state) => CustomTransitionPage(
                key: state.pageKey,
                child: const NotificationsPage(),
                transitionsBuilder: _fadeTransition,
              ),
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
