import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:trees_india/commons/components/button/app/views/outline_button_widget.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/commons/components/main_layout/app/views/main_layout_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/utils/open_custom_bottom_sheet.dart';
import 'package:trees_india/commons/app/user_profile_provider.dart';
import 'package:trees_india/commons/app/auth_provider.dart';

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
                  Icons.logout,
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
    final userProfileState = ref.watch(userProfileProvider);
    final user = userProfileState.user;

    return MainLayoutWidget(
      currentIndex: 3,
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: SingleChildScrollView(
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
                            child: user?.userImage != null &&
                                    user!.userImage!.isNotEmpty
                                ? Image.network(
                                    user.userImage!,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) {
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
                              if (user?.name != null && user!.name!.isNotEmpty)
                                H2Bold(
                                  text: user.name!,
                                  color: AppColors.brandNeutral900,
                                ),
                              if (user?.phone != null &&
                                  user!.phone!.isNotEmpty)
                                B2Regular(
                                  text: user.phone!,
                                  color: AppColors.brandNeutral600,
                                ),
                            ],
                          ),
                        ),
                        Icon(
                          Icons.edit_outlined,
                          size: 20,
                          color: AppColors.brandNeutral600,
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: AppSpacing.xl),

                // Quick Action Cards
                Row(
                  children: [
                    Expanded(
                      child: _buildQuickActionCard(
                        icon: Icons.assignment,
                        label: 'My bookings',
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text('My bookings coming soon!')),
                          );
                        },
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    // Expanded(
                    //   child: _buildQuickActionCard(
                    //     icon: Icons.devices,
                    //     label: 'Native devices',
                    //     onTap: () {
                    //       ScaffoldMessenger.of(context).showSnackBar(
                    //         const SnackBar(
                    //             content: Text('Native devices coming soon!')),
                    //       );
                    //     },
                    //   ),
                    // ),
                    // const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: _buildQuickActionCard(
                        icon: Icons.headset_mic,
                        label: 'Help & support',
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text('Help & support coming soon!')),
                          );
                        },
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: AppSpacing.xl),

                // Menu Items
                _buildMenuItem(
                  icon: Icons.description,
                  label: 'My Plans',
                  onTap: () {
                    context.push('/my-plans');
                  },
                ),
                _buildMenuItem(
                  icon: Icons.account_balance_wallet,
                  label: 'Wallet',
                  onTap: () {
                    context.push('/wallet');
                  },
                ),
                _buildMenuItem(
                  icon: Icons.star_border,
                  label: 'Plus membership',
                  onTap: () {
                    context.push('/plus-membership');
                  },
                ),
                // _buildMenuItem(
                //   icon: Icons.star_outline,
                //   label: 'My rating',
                //   onTap: () {
                //     context.push('/my-rating');
                //   },
                // ),
                _buildMenuItem(
                  icon: Icons.location_on,
                  label: 'Manage addresses',
                  onTap: () {
                    context.push('/manage-addresses');
                  },
                ),
                // _buildMenuItem(
                //   icon: Icons.credit_card,
                //   label: 'Manage payment methods',
                //   onTap: () {
                //     context.push('/manage-payment-methods');
                //   },
                // ),
                _buildMenuItem(
                  icon: Icons.settings,
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

                const SizedBox(height: AppSpacing.xl),

                // Logout Button
                SizedBox(
                  width: double.infinity,
                  child: SolidButtonWidget(
                    label: 'Logout',
                    backgroundColor: Colors.white,
                    labelColor: AppColors.stateRed600,
                    border: const BorderSide(color: AppColors.stateRed600),
                    onPressed: _showLogoutConfirmation,
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
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.brandNeutral200,
            width: 1,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 24,
              color: AppColors.brandPrimary600,
            ),
            const SizedBox(height: AppSpacing.sm),
            B4Medium(
              text: label,
              color: AppColors.brandNeutral700,
              textAlign: TextAlign.center,
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
              color: AppColors.brandNeutral600,
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: B3Regular(
                text: label,
                color: AppColors.brandNeutral700,
              ),
            ),
            const Icon(
              Icons.arrow_forward_ios,
              size: 16,
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
        Icons.person,
        size: 30,
        color: AppColors.brandPrimary600,
      ),
    );
  }
}
