import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/app/auth_provider.dart';
import 'package:trees_india/commons/constants/app_colors.dart';

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
    final authState = ref.watch(authProvider);
    final userType = authState.userType;
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
  }) {
    return GestureDetector(
      onTap: () => onTap(index),
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
                  right: -2,
                  top: -2,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppColors.stateRed500,
                      shape: BoxShape.circle,
                    ),
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
    );
  }
}
