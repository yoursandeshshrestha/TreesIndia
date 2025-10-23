import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/app_bar/app/views/custom_app_bar.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/presenters/providers/user_settings_provider.dart';

class NotificationSettingsPage extends ConsumerWidget {
  final VoidCallback onBack;

  const NotificationSettingsPage({
    super.key,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userSettingsState = ref.watch(userSettingsProvider);
    final userSettingsNotifier = ref.read(userSettingsProvider.notifier);


    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        onBack();
      },
      child: Scaffold(
        appBar: CustomAppBar(
          title: 'Notifications',
          backgroundColor: AppColors.white,
          iconColor: AppColors.brandNeutral800,
          titleColor: AppColors.brandNeutral800,
          onBackPressed: onBack,
        ),
        backgroundColor: Colors.grey[50],
        body: userSettingsState.isLoadingNotificationSettings
            ? _buildLoadingState()
            : _buildContent(context, userSettingsState, userSettingsNotifier),
      ),
    );
  }

  Widget _buildLoadingState() {
    return const Center(
      child: CircularProgressIndicator(),
    );
  }

  Widget _buildContent(
    BuildContext context,
    userSettingsState,
    userSettingsNotifier,
  ) {
    final settings = userSettingsState.notificationSettings;

    if (settings == null) {
      return const Center(
        child: Text(
          'Failed to load notification settings',
          style: TextStyle(color: Colors.red),
        ),
      );
    }

    final notificationItems = [
      NotificationItem(
        icon: Icons.email_outlined,
        title: 'Email Notifications',
        description:
            'Receive important updates and booking confirmations via email',
        isEnabled: settings.emailNotifications,
        settingKey: 'email_notifications',
      ),
      NotificationItem(
        icon: Icons.sms_outlined,
        title: 'SMS Notifications',
        description: 'Get instant updates and reminders via text message',
        isEnabled: settings.smsNotifications,
        settingKey: 'sms_notifications',
      ),
      NotificationItem(
        icon: Icons.notifications_outlined,
        title: 'Booking Reminders',
        description: 'Get reminded about upcoming service appointments',
        isEnabled: settings.bookingReminders,
        settingKey: 'booking_reminders',
      ),
      NotificationItem(
        icon: Icons.settings_outlined,
        title: 'Service Updates',
        description: 'Stay informed about service changes and improvements',
        isEnabled: settings.serviceUpdates,
        settingKey: 'service_updates',
      ),
      NotificationItem(
        icon: Icons.push_pin_outlined,
        title: 'Push Notifications',
        description: 'Receive real-time notifications on your device',
        isEnabled: settings.pushNotifications,
        settingKey: 'push_notifications',
      ),
      NotificationItem(
        icon: Icons.campaign_outlined,
        title: 'Marketing Emails',
        description: 'Receive promotional offers and special deals',
        isEnabled: settings.marketingEmails,
        settingKey: 'marketing_emails',
      ),
    ];

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Notifications',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w600,
              color: AppColors.brandNeutral900,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Manage your notification preferences',
            style: TextStyle(
              fontSize: 16,
              color: AppColors.brandNeutral500,
            ),
          ),
          const SizedBox(height: 24),
          Expanded(
            child: ListView.separated(
              itemCount: notificationItems.length,
              separatorBuilder: (context, index) => const Divider(
                height: 1,
                color: AppColors.brandNeutral300,
              ),
              itemBuilder: (context, index) {
                final item = notificationItems[index];
                return _buildNotificationTile(
                  context,
                  item,
                  userSettingsNotifier,
                  userSettingsState.isUpdatingNotificationSettings,
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationTile(
    BuildContext context,
    NotificationItem item,
    userSettingsNotifier,
    bool isUpdating,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16.0),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              item.icon,
              size: 20,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.black,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  item.description,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          if (isUpdating)
            const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          else
            _buildToggleSwitch(
              item.isEnabled,
              () => userSettingsNotifier
                  .toggleNotificationSetting(item.settingKey),
            ),
        ],
      ),
    );
  }

  Widget _buildToggleSwitch(bool enabled, VoidCallback onToggle) {
    return GestureDetector(
      onTap: onToggle,
      child: Container(
        width: 44,
        height: 24,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: enabled ? const Color(0xFF00A871) : Colors.grey[300],
        ),
        child: AnimatedAlign(
          duration: const Duration(milliseconds: 200),
          alignment: enabled ? Alignment.centerRight : Alignment.centerLeft,
          child: Container(
            width: 20,
            height: 20,
            margin: const EdgeInsets.symmetric(horizontal: 2),
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }
}

class NotificationItem {
  final IconData icon;
  final String title;
  final String description;
  final bool isEnabled;
  final String settingKey;

  NotificationItem({
    required this.icon,
    required this.title,
    required this.description,
    required this.isEnabled,
    required this.settingKey,
  });
}
