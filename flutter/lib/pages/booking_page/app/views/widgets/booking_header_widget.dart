import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/pages/services_page/domain/entities/service_detail_entity.dart';

class BookingHeaderWidget extends StatelessWidget {
  final ServiceDetailEntity service;

  const BookingHeaderWidget({
    super.key,
    required this.service,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.md,
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(
              Icons.arrow_back,
              color: AppColors.brandNeutral900,
              size: 24,
            ),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(
              minWidth: 40,
              minHeight: 40,
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                H3Bold(
                  text: 'Book ${service.name}',
                  color: AppColors.brandNeutral900,
                  textAlign: TextAlign.center,
                ),
                if (service.priceType == 'fixed')
                  B3Regular(
                    text: '₹${service.price}',
                    color: AppColors.brandNeutral600,
                    textAlign: TextAlign.center,
                  )
                else
                  B3Regular(
                    text: 'Inquiry Required',
                    color: AppColors.brandNeutral600,
                    textAlign: TextAlign.center,
                  )
              ],
            ),
          ),
          const SizedBox(width: 40), // Balance the back button
        ],
      ),
    );
  }
}
