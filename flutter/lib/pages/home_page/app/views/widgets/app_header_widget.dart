import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../../../commons/domain/entities/location_entity.dart';
import '../../../../../pages/notifications_page/app/providers/notification_providers.dart';

class AppHeaderWidget extends ConsumerWidget {
  final LocationEntity? currentLocation;
  final VoidCallback? onLocationTap;
  final VoidCallback? onBellTap;

  const AppHeaderWidget({
    super.key,
    this.currentLocation,
    this.onLocationTap,
    this.onBellTap,
  });

  String _getDisplayLocationWithCountry(LocationEntity location) {
    if (location.city != null && location.state != null) {
      return '${location.city}, ${location.state}';
    } else if (location.city != null) {
      return location.city!;
    } else {
      return location.address;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unreadCount = ref.watch(unreadCountProvider);

    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.sm,
        AppSpacing.lg,
        AppSpacing.md,
      ),
      child: Row(
        children: [
          // Location Section (Left)
          Expanded(
            child: GestureDetector(
              onTap: onLocationTap,
              child: currentLocation != null
                  ? Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Image.asset(
                              'assets/icons/location_pin.png',
                              width: 16,
                              height: 16,
                              color: AppColors.brandNeutral900,
                              errorBuilder: (context, error, stackTrace) {
                                print('Location icon error: $error');
                                return const Icon(
                                  Icons.location_on,
                                  size: 16,
                                  color: AppColors.brandNeutral900,
                                );
                              },
                            ),
                            const SizedBox(width: 6),
                            B3Bold(
                              text: _getDisplayLocationWithCountry(
                                  currentLocation!),
                              color: AppColors.brandNeutral900,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(width: 4),
                            const Icon(
                              Icons.keyboard_arrow_down,
                              size: 16,
                              color: AppColors.brandNeutral600,
                            ),
                          ],
                        ),
                        const SizedBox(height: 3),
                        SizedBox(
                          width: MediaQuery.of(context).size.width * 0.65,
                          child: B4Regular(
                            text: currentLocation!.address,
                            color: AppColors.brandNeutral600,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    )
                  : Row(
                      children: [
                        Image.asset(
                          'assets/icons/location_pin.png',
                          width: 16,
                          height: 16,
                          color: AppColors.brandNeutral900,
                          errorBuilder: (context, error, stackTrace) {
                            return const Icon(
                              Icons.location_on,
                              size: 16,
                              color: AppColors.brandNeutral900,
                            );
                          },
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: B3Regular(
                            text: 'Select Location',
                            color: AppColors.brandNeutral600,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
            ),
          ),

          // Bell Icon (Right) - Circular container with badge
          GestureDetector(
            onTap: onBellTap,
            child: Stack(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.brandNeutral100,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.brandNeutral200,
                      width: 1,
                    ),
                  ),
                  child: const Icon(
                    Icons.notifications_outlined,
                    size: 20,
                    color: AppColors.brandNeutral900,
                  ),
                ),
                // Unread count badge
                if (unreadCount > 0)
                  Positioned(
                    top: 2,
                    right: 2,
                    child: Container(
                      constraints: const BoxConstraints(minWidth: 16),
                      height: 16,
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      decoration: BoxDecoration(
                        color: AppColors.stateRed600,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: Colors.white,
                          width: 1,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          unreadCount > 99 ? '99+' : unreadCount.toString(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
