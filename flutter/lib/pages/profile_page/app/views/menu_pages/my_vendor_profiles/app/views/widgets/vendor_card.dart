import 'dart:io';

import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_vendor_profiles/app/views/widgets/vendor_profile_details_bottomsheet.dart';

import '../../../domain/entities/vendor_entity.dart';

class VendorCard extends StatelessWidget {
  final VendorEntity vendor;
  final bool isDeleting;
  final VoidCallback onDelete;

  const VendorCard({
    super.key,
    required this.vendor,
    required this.isDeleting,
    required this.onDelete,
  });

  void _showVendorProfileDetails(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => VendorProfileDetailsBottomSheet(
        vendor: vendor,
        onDelete: onDelete,
        isDeleting: isDeleting,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _showVendorProfileDetails(context),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.brandNeutral200),
          boxShadow: [
            BoxShadow(
              color: AppColors.brandNeutral200.withValues(alpha: 0.15),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 200,
              width: double.infinity,
              decoration: const BoxDecoration(
                borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
                color: AppColors.brandNeutral100,
              ),
              child: Stack(
                children: [
                  // Gallery images or placeholder
                  ClipRRect(
                    borderRadius:
                        const BorderRadius.vertical(top: Radius.circular(12)),
                    child: _buildGalleryPreview(),
                  ),
                  // Image count indicator
                  if (vendor.businessGallery.isNotEmpty)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.7),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.photo_library,
                              color: Colors.white,
                              size: 12,
                            ),
                            const SizedBox(width: 2),
                            Text(
                              '${vendor.businessGallery.length}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Vendor name
                  H3Bold(
                    text: vendor.vendorName,
                    color: AppColors.brandNeutral900,
                  ),

                  const SizedBox(height: 4),

                  // Location
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on,
                        size: 14,
                        color: AppColors.brandNeutral500,
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          _extractLocationFromAddress(vendor.businessAddress),
                          style: const TextStyle(
                            color: AppColors.brandNeutral600,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 8),

                  // Listed date with active badge
                  Row(
                    children: [
                      if (vendor.isActive) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.stateGreen100,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text(
                            'Active',
                            style: TextStyle(
                              color: AppColors.stateGreen700,
                              fontSize: 10,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                      ],
                      Text(
                        'Listed on ${_formatDate(DateTime.now())}',
                        style: const TextStyle(
                          color: AppColors.brandNeutral500,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // Business details grid
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Type',
                              style: TextStyle(
                                color: AppColors.brandNeutral500,
                                fontSize: 11,
                              ),
                            ),
                            const SizedBox(height: 2),
                            B4Bold(
                              text: _formatBusinessType(vendor.businessType),
                              color: AppColors.brandNeutral900,
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Experience',
                              style: TextStyle(
                                color: AppColors.brandNeutral500,
                                fontSize: 11,
                              ),
                            ),
                            const SizedBox(height: 2),
                            B4Bold(
                              text: vendor.yearsInBusiness > 0
                                  ? '${vendor.yearsInBusiness} years'
                                  : 'New',
                              color: AppColors.brandNeutral900,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 8),

                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Contact',
                              style: TextStyle(
                                color: AppColors.brandNeutral500,
                                fontSize: 11,
                              ),
                            ),
                            const SizedBox(height: 2),
                            B4Bold(
                              text: vendor.contactPersonName,
                              color: AppColors.brandNeutral900,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Phone',
                              style: TextStyle(
                                color: AppColors.brandNeutral500,
                                fontSize: 11,
                              ),
                            ),
                            const SizedBox(height: 2),
                            B4Bold(
                              text: vendor.contactPersonPhone,
                              color: AppColors.brandNeutral900,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // Services offered chips
                  if (vendor.servicesOffered.isNotEmpty) ...[
                    const Text(
                      'What We Sell',
                      style: TextStyle(
                        color: AppColors.brandNeutral500,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 6),
                    _buildServicesChips(),
                    const SizedBox(height: 12),
                  ],

                  // Action buttons
                  Row(
                    children: [
                      Expanded(
                        child: SizedBox(
                          height: 32,
                          child: OutlinedButton.icon(
                            onPressed: isDeleting ? null : onDelete,
                            icon: isDeleting
                                ? const SizedBox(
                                    width: 14,
                                    height: 14,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 1.5,
                                    ),
                                  )
                                : const Icon(
                                    Icons.delete_outline,
                                    size: 14,
                                  ),
                            label: Text(
                              isDeleting ? 'Deleting...' : 'Delete',
                              style: const TextStyle(fontSize: 12),
                            ),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.stateRed600,
                              side: const BorderSide(
                                color: AppColors.stateRed300,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(4.0),
                              ),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 4,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatBusinessType(String businessType) {
    switch (businessType.toLowerCase()) {
      case 'individual':
        return 'Individual';
      case 'partnership':
        return 'Partnership';
      case 'company':
        return 'Company';
      case 'llp':
        return 'LLP';
      case 'pvt_ltd':
        return 'Private Limited';
      case 'public_ltd':
        return 'Public Limited';
      case 'other':
        return 'Other';
      default:
        return businessType;
    }
  }

  Widget _buildGalleryPreview() {
    if (vendor.businessGallery.isEmpty) {
      return Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.stateGreen200,
              AppColors.stateGreen400,
            ],
          ),
        ),
        child: const Center(
          child: Icon(
            Icons.business,
            color: Colors.white,
            size: 32,
          ),
        ),
      );
    }

    final imagePath = vendor.businessGallery.first;

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return Image.network(
        imagePath,
        width: double.infinity,
        height: double.infinity,
        fit: BoxFit.cover,
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return Container(
            width: double.infinity,
            height: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppColors.stateGreen200,
                  AppColors.stateGreen400,
                ],
              ),
            ),
            child: const Center(
              child: CircularProgressIndicator(
                color: Colors.white,
                strokeWidth: 2,
              ),
            ),
          );
        },
        errorBuilder: (context, error, stackTrace) {
          return Container(
            width: double.infinity,
            height: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppColors.stateGreen200,
                  AppColors.stateGreen400,
                ],
              ),
            ),
            child: const Center(
              child: Icon(
                Icons.business,
                color: Colors.white,
                size: 32,
              ),
            ),
          );
        },
      );
    } else {
      final file = File(imagePath);
      if (file.existsSync()) {
        return Image.file(
          file,
          width: double.infinity,
          height: double.infinity,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) {
            return Container(
              width: double.infinity,
              height: double.infinity,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColors.stateGreen200,
                    AppColors.stateGreen400,
                  ],
                ),
              ),
              child: const Center(
                child: Icon(
                  Icons.business,
                  color: Colors.white,
                  size: 32,
                ),
              ),
            );
          },
        );
      } else {
        return Container(
          width: double.infinity,
          height: double.infinity,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.stateGreen200,
                AppColors.stateGreen400,
              ],
            ),
          ),
          child: const Center(
            child: Icon(
              Icons.business,
              color: Colors.white,
              size: 32,
            ),
          ),
        );
      }
    }
  }

  String _extractLocationFromAddress(String businessAddress) {
    try {
      // Parse the JSON string to extract city and state
      final cityMatch =
          RegExp(r'"city":\s*"([^"]+)"').firstMatch(businessAddress);
      final stateMatch =
          RegExp(r'"state":\s*"([^"]+)"').firstMatch(businessAddress);

      final city = cityMatch?.group(1) ?? '';
      final state = stateMatch?.group(1) ?? '';

      if (city.isNotEmpty && state.isNotEmpty) {
        return '$city, $state';
      } else if (city.isNotEmpty) {
        return city;
      } else if (state.isNotEmpty) {
        return state;
      }

      return 'Unknown Location';
    } catch (e) {
      return 'Unknown Location';
    }
  }

  Widget _buildServicesChips() {
    const maxVisibleChips = 3;
    final services = vendor.servicesOffered;
    final visibleServices = services.take(maxVisibleChips).toList();
    final remainingCount = services.length - maxVisibleChips;

    return Wrap(
      spacing: 6,
      runSpacing: 6,
      children: [
        // Show first 3 services as chips
        ...visibleServices.map((service) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.brandPrimary50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.brandPrimary200),
              ),
              child: Text(
                service,
                style: const TextStyle(
                  color: AppColors.brandPrimary700,
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                ),
              ),
            )),
        // Show "+X more" if there are more than 3 services
        if (remainingCount > 0)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.brandNeutral100,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.brandNeutral300),
            ),
            child: Text(
              '+$remainingCount more',
              style: const TextStyle(
                color: AppColors.brandNeutral600,
                fontSize: 10,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
      ],
    );
  }

  String _formatDate(DateTime date) {
    // Convert UTC to IST (+5:30)
    final istDate = date.toUtc().add(const Duration(hours: 5, minutes: 30));

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    return '${istDate.day} ${months[istDate.month - 1]} ${istDate.year}';
  }
}
