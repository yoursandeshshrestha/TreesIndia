import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';

class BottomNavBarWidget extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const BottomNavBarWidget({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Color(0x1A000000),
            blurRadius: 8,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                context,
                index: 0,
                icon: Icons.home,
                label: 'Home',
                isActive: currentIndex == 0,
              ),
              _buildNavItem(
                context,
                index: 1,
                icon: Icons.book_online,
                label: 'Bookings',
                isActive: currentIndex == 1,
              ),
              _buildNavItem(
                context,
                index: 2,
                icon: Icons.card_giftcard,
                label: 'Rewards',
                isActive: currentIndex == 2,
                hasNotification: true,
              ),
              _buildNavItem(
                context,
                index: 3,
                icon: Icons.person,
                label: 'Account',
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
                size: 24,
                color: isActive ? AppColors.brandPrimary600 : AppColors.brandNeutral400,
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
          const SizedBox(height: 4),
          B4Medium(
            text: label,
            color: isActive ? AppColors.brandPrimary600 : AppColors.brandNeutral400,
          ),
        ],
      ),
    );
  }
}
