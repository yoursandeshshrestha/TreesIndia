import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:trees_india/commons/app/auth_provider.dart';
import 'package:trees_india/commons/components/button/app/views/outline_button_widget.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/commons/components/main_layout/app/views/main_layout_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/domain/entities/user_profile_entity.dart';
import 'package:trees_india/commons/utils/date_utils.dart';
import 'package:trees_india/commons/utils/open_custom_bottom_sheet.dart';

import '../providers/profile_providers.dart';

class ProfilePage extends ConsumerStatefulWidget {
  const ProfilePage({super.key});

  @override
  ConsumerState<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends ConsumerState<ProfilePage> {
  bool _isLoggingOut = false;
  String _appVersion = '';

  @override
  void initState() {
    super.initState();
    _loadAppVersion();
    // Load profile data when page initializes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(profileProvider.notifier).loadProfile();
    });
  }

  Future<void> _loadAppVersion() async {
    final packageInfo = await PackageInfo.fromPlatform();
    setState(() {
      _appVersion = 'Version ${packageInfo.version}+${packageInfo.buildNumber}';
    });
  }

  void _showLogoutConfirmation() {
    openCustomBottomSheet(
        context: context,
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Icon
              Container(
                width: 60,
                height: 60,
                decoration: const BoxDecoration(
                  color: AppColors.stateRed100,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.logout_outlined,
                  size: 30,
                  color: AppColors.stateRed600,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),

              // Title
              H3Medium(
                text: 'Are you sure you want to logout?',
                color: AppColors.brandNeutral900,
              ),

              const SizedBox(height: AppSpacing.xl),

              // Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButtonWidget(
                      label: 'Cancel',
                      labelColor: AppColors.brandNeutral700,
                      borderColor: AppColors.brandNeutral700,
                      onPressed: () => Navigator.pop(context),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: SolidButtonWidget(
                      label: 'Logout',
                      backgroundColor: AppColors.stateRed600,
                      isLoading: _isLoggingOut,
                      onPressed: _isLoggingOut
                          ? null
                          : () {
                              Navigator.pop(context);
                              _logout();
                            },
                    ),
                  ),
                ],
              ),
            ],
          ),
        ));
  }

  Future<void> _logout() async {
    setState(() {
      _isLoggingOut = true;
    });

    try {
      await ref.read(authProvider.notifier).logout();
      if (mounted) {
        // Navigate to login page after successful logout
        context.go('/login');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Logout failed: ${e.toString()}'),
            backgroundColor: AppColors.stateRed600,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoggingOut = false;
        });
      }
    }
  }

  void _navigateToEditProfile() {
    context.push('/edit-profile');
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileProvider);


    return MainLayoutWidget(
      currentIndex: 3,
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Padded content section
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Profile Header Section
                      GestureDetector(
                        onTap: _navigateToEditProfile,
                        child: Container(
                          color: Colors.transparent,
                          child: Row(
                            children: [
                              // Avatar
                              Container(
                                width: 60,
                                height: 60,
                                child: ClipOval(
                                  child: profileState.avatarUrl != null &&
                                          profileState.avatarUrl!.isNotEmpty
                                      ? Image.network(
                                          profileState.avatarUrl!,
                                          fit: BoxFit.cover,
                                          errorBuilder:
                                              (context, error, stackTrace) {
                                            return _buildDefaultAvatar();
                                          },
                                        )
                                      : _buildDefaultAvatar(),
                                ),
                              ),
                              const SizedBox(width: AppSpacing.md),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    if (profileState.name != null &&
                                        profileState.name!.isNotEmpty)
                                      H2Bold(
                                        text: profileState.name!,
                                        color: AppColors.brandNeutral900,
                                      ),
                                    if (profileState.phone != null &&
                                        profileState.phone!.isNotEmpty)
                                      B2Regular(
                                        text: profileState.phone!,
                                        color: AppColors.brandNeutral900,
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: AppSpacing.md),

                      // Subscription Badge/Card
                      if (profileState.subscription != null &&
                          profileState.subscription!.status == 'active')
                        _buildSubscriptionCard(profileState.subscription!),

                      // const SizedBox(height: AppSpacing.sm),

                      // Quick Action Cards
                      // Row(
                      //   children: [
                      //     // Expanded(
                      //     //   child: _buildQuickActionCard(
                      //     //     icon: Icons.calendar_today_outlined,
                      //     //     label: 'My bookings',
                      //     //     onTap: () {
                      //     //       ScaffoldMessenger.of(context).showSnackBar(
                      //     //         const SnackBar(
                      //     //             content:
                      //     //                 Text('My bookings coming soon!')),
                      //     //       );
                      //     //     },
                      //     //   ),
                      //     // ),
                      //     // const SizedBox(width: AppSpacing.md),
                      //     // Expanded(
                      //     //   child: _buildQuickActionCard(
                      //     //     icon: Icons.devices,
                      //     //     label: 'Native devices',
                      //     //     onTap: () {
                      //     //       ScaffoldMessenger.of(context).showSnackBar(
                      //     //         const SnackBar(
                      //     //             content: Text('Native devices coming soon!')),
                      //     //       );
                      //     //     },
                      //     //   ),
                      //     // ),
                      //     // const SizedBox(width: AppSpacing.md),
                      //     // Expanded(
                      //     //   child: _buildQuickActionCard(
                      //     //     icon: Icons.support_agent_outlined,
                      //     //     label: 'Help & support',
                      //     //     onTap: () {
                      //     //       ScaffoldMessenger.of(context).showSnackBar(
                      //     //         const SnackBar(
                      //     //             content:
                      //     //                 Text('Help & support coming soon!')),
                      //     //       );
                      //     //     },
                      //     //   ),
                      //     // ),
                      //   ],
                      // ),
                    ],
                  ),
                ),

                // Top separator - big border like home page banner (full width, no padding)
                Container(
                  width: double.infinity,
                  height: 8,
                  color: const Color(0xFFF5F5F5),
                ),

                // Padded content section for menu items
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Menu Items

                      _buildMenuItem(
                        icon: Icons.account_balance_wallet_outlined,
                        label: 'Wallet',
                        onTap: () {
                          context.push('/wallet');
                        },
                      ),

                      _buildMenuItem(
                        icon: Icons.location_on_outlined,
                        label: 'Manage addresses',
                        onTap: () {
                          context.push('/manage-addresses');
                        },
                      ),

                      _buildMenuItem(
                        icon: Icons.home_outlined,
                        label: 'My Properties',
                        onTap: () {
                          context.push('/my-properties');
                        },
                      ),

                      // Show My Vendor Profiles only for users with active subscription
                      if (profileState.subscription != null &&
                          profileState.subscription!.status == 'active')
                        _buildMenuItem(
                          icon: Icons.business_outlined,
                          label: 'My Vendor Profiles',
                          onTap: () {
                            context.push('/my-vendor-profiles');
                          },
                        ),

                      _buildMenuItem(
                        icon: Icons.work_outline,
                        label: 'Apply for Worker',
                        onTap: () {
                          context.push('/worker-application');
                        },
                      ),
                      _buildMenuItem(
                        icon: Icons.work_outline,
                        label: 'Apply for Broker',
                        onTap: () {
                          context.push('/broker-application');
                        },
                      ),
                      _buildMenuItem(
                        icon: Icons.home_outlined,
                        label: 'My Subscription',
                        onTap: () {
                          context.push('/my-subscription');
                        },
                      ),

                      _buildMenuItem(
                        icon: Icons.settings_outlined,
                        label: 'Settings',
                        onTap: () {
                          context.push('/settings');
                        },
                      ),
                      _buildMenuItem(
                        icon: Icons.info_outline,
                        label: 'About TreesIndia',
                        onTap: () {
                          context.push('/about-trees-india');
                        },
                      ),
                      const SizedBox(height: AppSpacing.md),

                      if (profileState.roleApplication != null &&
                          profileState.roleApplication!.status != 'none')
                        _buildRoleApplicationCard(
                            profileState.roleApplication!),

                      const SizedBox(height: AppSpacing.xl),

                      // Logout Button
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton(
                          onPressed: _showLogoutConfirmation,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: AppColors.stateRed600,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                              side: const BorderSide(
                                color: Color.fromARGB(255, 226, 224, 224),
                              ),
                            ),
                          ),
                          child: const Text(
                            'Logout',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: AppColors.stateRed600,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: AppSpacing.lg),

                      // Version
                      Center(
                        child: B4Regular(
                          text: _appVersion.isNotEmpty ? _appVersion : '',
                          color: AppColors.brandNeutral400,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActionCard({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: const Color(0xFFF5F5F5),
            width: 1,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 28,
              color: AppColors.brandNeutral700,
            ),
            const SizedBox(height: 16),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Colors.black87,
                height: 1.3,
                letterSpacing: 0.2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
        child: Row(
          children: [
            Icon(
              icon,
              size: 20,
              color: AppColors.brandNeutral900,
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: B3Regular(
                text: label,
                color: AppColors.brandNeutral900,
              ),
            ),
            const Icon(
              Icons.arrow_forward_ios_outlined,
              size: 14,
              color: AppColors.brandNeutral400,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDefaultAvatar() {
    return Container(
      color: AppColors.brandPrimary100,
      child: const Icon(
        Icons.person_outline,
        size: 30,
        color: AppColors.brandPrimary600,
      ),
    );
  }

  Widget _buildRoleApplicationCard(RoleApplicationEntity roleApplication) {
    // Parse dates
    DateTime? applicationDate;
    DateTime? approvalDate;

    try {
      if (roleApplication.applicationDate != null &&
          roleApplication.applicationDate!.isNotEmpty) {
        applicationDate =
            ISTDateUtils.convertToIST(roleApplication.applicationDate!);
      }
      if (roleApplication.approvalDate != null &&
          roleApplication.approvalDate!.isNotEmpty) {
        approvalDate = ISTDateUtils.convertToIST(roleApplication.approvalDate!);
      }
    } catch (e) {
      debugPrint('Error parsing role application dates: $e');
    }

    final dateFormat = DateFormat('MMM dd, yyyy');

    return GestureDetector(
      onTap: () {
        context.push('/worker-application');
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.brandNeutral200),
          boxShadow: [
            BoxShadow(
              color: AppColors.brandNeutral100.withOpacity(0.5),
              spreadRadius: 1,
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            H4Bold(text: 'Role Application Status'),
            const SizedBox(height: AppSpacing.xs),
            B3Regular(
                text: 'Track your application to become a service provider'),
            const SizedBox(height: AppSpacing.lg),

            // Status section
            if (roleApplication.status == 'pending')
              _buildPendingStatus()
            else if (roleApplication.status == 'approved')
              _buildApprovedStatus()
            else if (roleApplication.status == 'rejected')
              _buildRejectedStatus(),

            const SizedBox(height: AppSpacing.lg),
            const Divider(color: AppColors.brandNeutral200),
            const SizedBox(height: AppSpacing.lg),

            // Dates
            Row(
              children: [
                Expanded(
                  child: _buildDateCard(
                    label: 'Application Date',
                    date: applicationDate != null
                        ? dateFormat.format(applicationDate)
                        : '--',
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _buildDateCard(
                    label: 'Approval Date',
                    date: approvalDate != null
                        ? dateFormat.format(approvalDate)
                        : '--',
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPendingStatus() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.watch_later_outlined,
                color: AppColors.stateYellow700, size: 20),
            const SizedBox(width: AppSpacing.sm),
            B2Medium(text: 'Under Review'),
            const SizedBox(width: AppSpacing.sm),
            Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
              decoration: BoxDecoration(
                color: AppColors.stateYellow100,
                borderRadius: BorderRadius.circular(16),
              ),
              child: B4Medium(text: 'PENDING', color: AppColors.stateYellow800),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        B3Regular(
            text:
                'Your application is currently under review. We\'ll notify you once a decision is made.'),
      ],
    );
  }

  Widget _buildApprovedStatus() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.check_circle_outline,
                color: AppColors.stateGreen700, size: 20),
            const SizedBox(width: AppSpacing.sm),
            B2Medium(text: 'Approved'),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        B3Regular(text: 'Congratulations! Your application has been approved.'),
      ],
    );
  }

  Widget _buildRejectedStatus() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.cancel_outlined,
                color: AppColors.stateRed700, size: 20),
            const SizedBox(width: AppSpacing.sm),
            B2Medium(text: 'Rejected'),
            const SizedBox(width: AppSpacing.sm),
            Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
              decoration: BoxDecoration(
                color: AppColors.stateRed100,
                borderRadius: BorderRadius.circular(16),
              ),
              child: B4Medium(text: 'REJECTED', color: AppColors.stateRed800),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        B3Regular(
            text:
                'Unfortunately, your application was not approved. Please contact support for more information.'),
      ],
    );
  }

  Widget _buildDateCard({required String label, required String date}) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.brandNeutral50,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          B4Regular(text: label, color: AppColors.brandNeutral500),
          const SizedBox(height: AppSpacing.xs),
          B2Medium(text: date),
        ],
      ),
    );
  }

  Widget _buildSubscriptionCard(SubscriptionEntity subscription) {
    // Parse dates
    DateTime? startDate;
    DateTime? endDate;

    try {
      startDate = ISTDateUtils.convertToIST(subscription.startDate);
      endDate = ISTDateUtils.convertToIST(subscription.endDate);
    } catch (e) {
      debugPrint('Error parsing subscription dates: $e');
    }

    final dateFormat = DateFormat('MMM dd, yyyy');

    return GestureDetector(
      onTap: () {
        context.push('/my-subscription');
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF055c3a), Color(0xFF0a7c4a)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF055c3a).withValues(alpha: 0.2),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            // Premium icon
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.workspace_premium,
                color: Colors.white,
                size: 24,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            // Subscription details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Premium Active',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  if (startDate != null && endDate != null)
                    Text(
                      '${dateFormat.format(startDate)} - ${dateFormat.format(endDate)}',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.9),
                        fontSize: 12,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  if (endDate != null)
                    Text(
                      'Expires ${dateFormat.format(endDate)}',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.8),
                        fontSize: 11,
                        fontWeight: FontWeight.w300,
                      ),
                    ),
                ],
              ),
            ),
            // Arrow icon
            Icon(
              Icons.arrow_forward_ios,
              color: Colors.white.withValues(alpha: 0.8),
              size: 16,
            ),
          ],
        ),
      ),
    );
  }
}
