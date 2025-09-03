import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import '../../viewmodels/booking_state.dart';

class DateSelectionWidget extends ConsumerWidget {
  final BookingState bookingState;
  final DateTime? selectedDate;
  final String serviceId;
  final Function(DateTime) onDateSelected;

  const DateSelectionWidget({
    super.key,
    required this.bookingState,
    required this.selectedDate,
    required this.serviceId,
    required this.onDateSelected,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H4Bold(
          text: 'Select Date',
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.md),
        SizedBox(
          height: 80,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: int.tryParse(
                    bookingState.bookingConfig?.bookingAdvanceDays.toString() ??
                        '') ??
                3,
            itemBuilder: (context, index) {
              final date = DateTime.now().add(Duration(days: index + 1));
              final isSelected = selectedDate?.day == date.day &&
                  selectedDate?.month == date.month;

              return GestureDetector(
                onTap: () => onDateSelected(date),
                child: Container(
                  width: 70,
                  margin: const EdgeInsets.only(right: AppSpacing.sm),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected
                          ? const Color(0xFF055c3a)
                          : AppColors.brandNeutral200,
                      width: 1,
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      B4Regular(
                        text: [
                          'Sun',
                          'Mon',
                          'Tue',
                          'Wed',
                          'Thu',
                          'Fri',
                          'Sat'
                        ][date.weekday % 7],
                        color: AppColors.brandNeutral500,
                      ),
                      const SizedBox(height: 4),
                      H4Bold(
                        text: date.day.toString(),
                        color: AppColors.brandNeutral900,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
