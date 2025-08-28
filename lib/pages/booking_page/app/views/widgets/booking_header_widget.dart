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
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Row(
        children: [
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.close),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                H3Bold(
                  text: 'Book ${service.name}',
                  color: AppColors.brandNeutral900,
                ),
                B3Regular(
                  text:
                      '₹${service.price} • ${service.duration ?? 'Duration not specified'}',
                  color: AppColors.brandNeutral600,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}