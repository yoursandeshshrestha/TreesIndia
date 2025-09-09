import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';

class CancelBookingBottomSheet extends StatefulWidget {
  final String bookingReference;

  const CancelBookingBottomSheet({
    super.key,
    required this.bookingReference,
  });

  static Future<Map<String, String>?> show(
      BuildContext context, String bookingReference) {
    return showModalBottomSheet<Map<String, String>>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) =>
          CancelBookingBottomSheet(bookingReference: bookingReference),
    );
  }

  @override
  State<CancelBookingBottomSheet> createState() =>
      _CancelBookingBottomSheetState();
}

class _CancelBookingBottomSheetState extends State<CancelBookingBottomSheet> {
  String? selectedReason;
  final TextEditingController additionalReasonController =
      TextEditingController();

  final List<Map<String, String>> cancellationReasons = [
    {'value': 'schedule_conflict', 'label': 'Schedule conflict'},
    {'value': 'found_alternative', 'label': 'Found alternative service'},
    {'value': 'no_longer_needed', 'label': 'Service no longer needed'},
    {'value': 'price_concern', 'label': 'Price concern'},
    {'value': 'service_not_available', 'label': 'Service not available'},
    {'value': 'personal_emergency', 'label': 'Personal emergency'},
    {'value': 'other', 'label': 'Other'},
  ];

  @override
  void dispose() {
    additionalReasonController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(20),
              topRight: Radius.circular(20),
            ),
          ),
          child: Column(
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(top: AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.brandNeutral300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      H3Bold(
                        text: 'Cancel Booking',
                        color: AppColors.brandNeutral800,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      B3Medium(
                        text: 'Booking: ${widget.bookingReference}',
                        color: AppColors.brandNeutral600,
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      B3Medium(
                        text: 'Reason for cancellation:',
                        color: AppColors.brandNeutral800,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.sm),
                        decoration: BoxDecoration(
                          border: Border.all(color: AppColors.brandNeutral300),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: selectedReason,
                            hint: B3Medium(
                              text: 'Select a reason',
                              color: AppColors.brandNeutral500,
                            ),
                            isExpanded: true,
                            items: cancellationReasons.map((reason) {
                              return DropdownMenuItem<String>(
                                value: reason['value'],
                                child: B3Medium(
                                  text: reason['label']!,
                                  color: AppColors.brandNeutral800,
                                ),
                              );
                            }).toList(),
                            onChanged: (value) {
                              setState(() {
                                selectedReason = value;
                              });
                            },
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      B3Medium(
                        text: 'Additional reason (optional):',
                        color: AppColors.brandNeutral800,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      TextField(
                        controller: additionalReasonController,
                        onTapOutside: (_) => FocusScope.of(context).unfocus(),
                        maxLines: 3,
                        decoration: InputDecoration(
                          hintText: 'Enter additional details...',
                          hintStyle:
                              TextStyle(color: AppColors.brandNeutral500),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide:
                                BorderSide(color: AppColors.brandNeutral300),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide:
                                BorderSide(color: AppColors.brandNeutral300),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide:
                                BorderSide(color: AppColors.brandPrimary600),
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xl),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => Navigator.of(context).pop(),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(
                                    vertical: AppSpacing.md),
                                side: BorderSide(
                                    color: AppColors.brandNeutral300),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: B3Medium(
                                text: 'Cancel',
                                color: AppColors.brandNeutral600,
                              ),
                            ),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: selectedReason == null
                                  ? null
                                  : () {
                                      Navigator.of(context).pop({
                                        'reason': selectedReason!,
                                        'cancellation_reason':
                                            additionalReasonController.text
                                                .trim(),
                                      });
                                    },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.stateRed600,
                                foregroundColor: AppColors.white,
                                padding: const EdgeInsets.symmetric(
                                    vertical: AppSpacing.md),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: B3Bold(
                                text: 'Cancel Booking',
                                color: AppColors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
