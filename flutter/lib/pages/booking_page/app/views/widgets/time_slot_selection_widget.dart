import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/components/skeleton/app/views/skeleton_widget.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/utils/utils.dart';
import '../../viewmodels/booking_state.dart';

class TimeSlotSelectionWidget extends ConsumerWidget {
  final BookingState bookingState;
  final String? selectedTime;
  final Function(String) onTimeSelected;

  const TimeSlotSelectionWidget({
    super.key,
    required this.bookingState,
    required this.selectedTime,
    required this.onTimeSelected,
  });

  String _convertTo12HourFormat(String time24) {
    try {
      final parts = time24.split(':');
      int hour = int.parse(parts[0]);
      final minute = parts[1];

      final period = hour >= 12 ? 'PM' : 'AM';
      hour = hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour);

      return '$hour:$minute $period';
    } catch (e) {
      return time24;
    }
  }

  String _getServiceDuration() {
    // Get duration from available slots response
    final duration = bookingState.availableSlots?.serviceDuration ?? 45;
    return Utils.formatDurationFromMinutes(duration);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H4Bold(
          text: 'Select time',
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.sm),
        B3Regular(
          text: 'Your service will take approx. ${_getServiceDuration()}',
          color: AppColors.brandNeutral600,
        ),
        const SizedBox(height: AppSpacing.md),
        if (bookingState.isLoading)
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: AppSpacing.sm,
              mainAxisSpacing: AppSpacing.sm,
              childAspectRatio: 2.8,
            ),
            itemCount: 12,
            itemBuilder: (context, index) {
              return SkeletonWidget(
                width: double.infinity,
                height: double.infinity,
                borderRadius: BorderRadius.circular(8),
              );
            },
          )
        else if (bookingState.availableSlots != null)
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: AppSpacing.sm,
              mainAxisSpacing: AppSpacing.sm,
              childAspectRatio: 2.8,
            ),
            itemCount: bookingState.availableSlots!.availableSlots
                .where((slot) => slot.isAvailable)
                .length,
            itemBuilder: (context, index) {
              final availableSlots = bookingState.availableSlots!.availableSlots
                  .where((slot) => slot.isAvailable)
                  .toList();
              final slot = availableSlots[index];
              final isSelected = selectedTime == slot.time;
              final displayTime = _convertTo12HourFormat(slot.time);

              return GestureDetector(
                onTap: () => onTimeSelected(slot.time),
                child: Container(
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF055c3a) : Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isSelected
                          ? const Color(0xFF055c3a)
                          : AppColors.brandNeutral200,
                      width: 1,
                    ),
                  ),
                  child: Center(
                    child: B3Regular(
                      text: displayTime,
                      color:
                          isSelected ? Colors.white : AppColors.brandNeutral900,
                    ),
                  ),
                ),
              );
            },
          )
        else if (bookingState.errorMessage != null)
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.stateRed50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.stateRed200),
            ),
            child: B3Regular(
              text: bookingState.errorMessage!,
              color: AppColors.stateRed700,
            ),
          ),
      ],
    );
  }
}
