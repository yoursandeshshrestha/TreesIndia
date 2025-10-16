import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/app_bar/app/views/custom_app_bar.dart';
import 'package:trees_india/commons/components/connectivity/connectivity_provider.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/presenters/providers/notification_service_provider.dart';
import 'package:trees_india/commons/presenters/providers/user_settings_provider.dart';
import 'package:trees_india/commons/presenters/viewmodels/user_settings_viewmodel/user_settings_notifier.dart';
import 'otp_bottom_sheet.dart';
import 'delete_confirmation_bottom_sheet.dart';

class AccountSettingsPage extends ConsumerStatefulWidget {
  final VoidCallback onBack;

  const AccountSettingsPage({
    super.key,
    required this.onBack,
  });

  @override
  ConsumerState<AccountSettingsPage> createState() =>
      _AccountSettingsPageState();
}

class _AccountSettingsPageState extends ConsumerState<AccountSettingsPage> {
  @override
  Widget build(BuildContext context) {
    final userSettingsState = ref.watch(userSettingsProvider);
    final userSettingsNotifier = ref.read(userSettingsProvider.notifier);
    final isConnected = ref.watch(connectivityNotifierProvider);
    if (!isConnected) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(notificationServiceProvider).showOfflineMessage(
              context,
              onRetry: () => debugPrint('Retrying…'),
            );
      });
    }

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        widget.onBack();
      },
      child: Scaffold(
        appBar: CustomAppBar(
          title: 'Account',
          backgroundColor: AppColors.white,
          iconColor: AppColors.brandNeutral800,
          titleColor: AppColors.brandNeutral800,
          onBackPressed: widget.onBack,
        ),
        backgroundColor: Colors.grey[50],
        body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Account',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w600,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Manage your account settings',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 24),
              _buildAccountDeletionPolicy(),
              const SizedBox(height: 16),
              _buildDeleteAccountSection(userSettingsNotifier),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAccountDeletionPolicy() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Colors.grey[200]!),
              ),
            ),
            child: const Text(
              'Account Deletion Policy',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.black,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _buildPolicyItem(
                    'You\'ll no longer be able to access your saved professionals'),
                _buildPolicyItem('Your customer rating will be reset'),
                _buildPolicyItem('All your memberships will be cancelled'),
                _buildPolicyItem(
                    'You\'ll not be able to claim under any active warranty or insurance'),
                _buildPolicyItem('The changes are irreversible'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPolicyItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(top: 8),
            width: 4,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[400],
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[700],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeleteAccountSection(UserSettingsNotifier userSettingsNotifier) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Delete Account',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.black,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Permanently delete your account and all associated data',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          ElevatedButton(
            onPressed: () {
              DeleteConfirmationBottomSheet.show(
                context: context,
                onConfirm: () async {
                  Navigator.of(context).pop(); // Close the confirmation sheet
                  await userSettingsNotifier.requestDeleteOtp();

                  // Check if OTP was requested successfully and show OTP sheet
                  final currentState = ref.read(userSettingsProvider);
                  if (currentState.deleteOtpResponse != null && mounted) {
                    OtpBottomSheet.show(
                      context: context,
                      phoneNumber: currentState.deleteOtpResponse!.phone,
                      onSubmit: (otp) async {
                        final success =
                            await userSettingsNotifier.deleteAccount(otp);
                        if (success && mounted) {
                          Navigator.of(context)
                              .popUntil((route) => route.isFirst);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Account deleted successfully'),
                              backgroundColor: Colors.green,
                            ),
                          );
                        }
                      },
                      isDeleting: currentState.isDeletingAccount,
                    );
                  }
                },
                isLoading:
                    ref.watch(userSettingsProvider).isRequestingDeleteOtp,
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red[600],
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('Delete Account'),
          ),
        ],
      ),
    );
  }
}
