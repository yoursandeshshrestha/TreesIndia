import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/pages/services_page/domain/entities/service_detail_entity.dart';
import 'package:trees_india/commons/widgets/address_selector/domain/entities/address_entity.dart';
import 'booking_info_section_widget.dart';

class BookingSummaryWidget extends StatelessWidget {
  final ServiceDetailEntity service;
  final DateTime? selectedDate;
  final String? selectedTime;
  final AddressEntity? selectedAddress;
  final String contactPerson;
  final String contactPhone;
  final String description;
  final String specialInstructions;

  const BookingSummaryWidget({
    super.key,
    required this.service,
    required this.selectedDate,
    required this.selectedTime,
    required this.selectedAddress,
    required this.contactPerson,
    required this.contactPhone,
    required this.description,
    required this.specialInstructions,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H4Bold(
          text: 'Booking Summary',
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.lg),

        // Service Information
        Container(
          padding: const EdgeInsets.all(0),
          decoration: BoxDecoration(
            color: AppColors.brandNeutral50,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              B1Bold(
                text: service.name,
                color: AppColors.brandNeutral900,
              ),
              const SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  const Icon(Icons.calendar_today,
                      size: 16, color: AppColors.brandNeutral600),
                  const SizedBox(width: AppSpacing.xs),
                  B3Regular(
                    text: selectedDate != null
                        ? '${selectedDate!.day}/${selectedDate!.month}/${selectedDate!.year}'
                        : 'No date selected',
                    color: AppColors.brandNeutral600,
                  ),
                  const SizedBox(width: AppSpacing.lg),
                  const Icon(Icons.access_time,
                      size: 16, color: AppColors.brandNeutral600),
                  const SizedBox(width: AppSpacing.xs),
                  B3Regular(
                    text: selectedTime ?? 'No time selected',
                    color: AppColors.brandNeutral600,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  B2Regular(
                    text: 'Service Price:',
                    color: AppColors.brandNeutral700,
                  ),
                  B1Bold(
                    text: '₹${service.price}',
                    color: AppColors.brandPrimary700,
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.lg),

        // Address Information
        if (selectedAddress != null)
          BookingInfoSectionWidget(
            title: 'Service Address',
            info: [
              selectedAddress!.name,
              selectedAddress!.fullAddress,
            ],
          ),

        const SizedBox(height: AppSpacing.lg),

        // Contact Information
        BookingInfoSectionWidget(
          title: 'Contact Information',
          info: [
            contactPerson,
            contactPhone,
          ],
        ),

        const SizedBox(height: AppSpacing.lg),

        // Service Description
        if (description.isNotEmpty)
          BookingInfoSectionWidget(
            title: 'Service Description',
            info: [
              description,
            ],
          ),

        if (specialInstructions.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.lg),
          BookingInfoSectionWidget(
            title: 'Special Instructions',
            info: [
              specialInstructions,
            ],
          ),
        ],
      ],
    );
  }
}
