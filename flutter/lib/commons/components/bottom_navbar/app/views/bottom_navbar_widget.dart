import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/pages/profile_page/app/providers/profile_providers.dart';
import 'package:trees_india/pages/chats_page/app/providers/unread_count_provider.dart';

class BottomNavBarWidget extends ConsumerWidget {
  final int currentIndex;
  final Function(int) onTap;

  const BottomNavBarWidget({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileState = ref.watch(profileProvider);
    final userType = profileState.userType;
    final unreadCountState = ref.watch(unreadCountProvider);
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(
            color: Color(0xFFE5E7EB), // Light gray border
            width: 1,
          ),
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                context,
                index: 0,
                icon: Icons.dashboard_outlined,
                label: 'Home',
                isActive: currentIndex == 0,
              ),
              _buildNavItem(
                context,
                index: 1,
                icon: userType == 'worker'
                    ? Icons.work_outline
                    : userType == 'normal'
                        ? Icons.calendar_today_outlined
                        : Icons.chat_bubble_outline,
                label: userType == 'worker'
                    ? 'My Work'
                    : userType == 'normal'
                        ? 'Bookings'
                        : '',
                isActive: currentIndex == 1,
              ),
              _buildNavItem(
                context,
                index: 2,
                icon: Icons.chat_bubble_outline,
                label: 'Chat',
                isActive: currentIndex == 2,
                hasNotification: unreadCountState.totalUnreadCount > 0,
                notificationCount: unreadCountState.totalUnreadCount,
              ),
              _buildNavItem(
                context,
                index: 3,
                icon: Icons.account_circle_outlined,
                label: 'Profile',
                isActive: currentIndex == 3,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context, {
    required int index,
    required IconData icon,
    required String label,
    required bool isActive,
    bool hasNotification = false,
    int notificationCount = 0,
  }) {
    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => onTap(index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Stack(
                children: [
                  Icon(
                    icon,
                    size: 20, // text-lg equivalent
                    color: isActive
                        ? const Color(0xFF055c3a)
                        : const Color(0xFF9CA3AF), // text-[#055c3a] : text-gray-400
                  ),
                  if (hasNotification)
                    Positioned(
                      right: 0,
                      top: 0,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: AppColors.stateRed500,
                          shape: BoxShape.circle,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 16,
                          minHeight: 16,
                        ),
                        child: notificationCount > 0
                            ? Text(
                                notificationCount > 99
                                    ? '99+'
                                    : notificationCount.toString(),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                                textAlign: TextAlign.center,
                              )
                            : null,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 4), // gap-1 equivalent
              Text(
                label,
                style: TextStyle(
                  fontSize: 12, // text-xs
                  fontWeight: FontWeight.w500, // font-medium
                  color: isActive
                      ? const Color(0xFF055c3a)
                      : const Color(0xFF9CA3AF), // text-[#055c3a] : text-gray-400
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
