import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/service_entity.dart';

class ServiceCardWidget extends StatelessWidget {
  final ServiceEntity service;
  final VoidCallback? onTap;

  const ServiceCardWidget({
    super.key,
    required this.service,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: IntrinsicHeight(
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.md, horizontal: AppSpacing.sm),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppColors.brandNeutral200,
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.brandNeutral900.withValues(alpha: 0.05),
                offset: const Offset(0, 2),
                blurRadius: 8,
                spreadRadius: 0,
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.brandPrimary50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: AppColors.brandPrimary200,
                    width: 1,
                  ),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.asset(
                    service.iconUrl,
                    width: 32,
                    height: 32,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return const Icon(
                        Icons.build,
                        size: 24,
                        color: AppColors.brandPrimary600,
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Expanded(
                child: B4Medium(
                  text: service.name,
                  color: AppColors.brandNeutral900,
                  textAlign: TextAlign.center,
                  
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ServiceCardsGridWidget extends StatelessWidget {
  final List<ServiceEntity> services;
  final Function(ServiceEntity)? onServiceTap;

  const ServiceCardsGridWidget({
    super.key,
    required this.services,
    this.onServiceTap,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        // Calculate card width to fit 3 cards per row with spacing
        final availableWidth = constraints.maxWidth;
        const spacing = AppSpacing.sm;
        const totalSpacing = spacing * 2; // 2 gaps between 3 cards
        final cardWidth = (availableWidth - totalSpacing) / 3;

        return Wrap(
          spacing: AppSpacing.sm,
          
          runSpacing: AppSpacing.sm,
          children: services.map((service) {
            return SizedBox(
              width: cardWidth,
              child: ServiceCardWidget(
                service: service,
                onTap: () => onServiceTap?.call(service),
              ),
            );
          }).toList(),
        );
      },
    );
  }
}
