import 'dart:io';
import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/components/button/app/views/outline_button_widget.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import '../../../domain/entities/vendor_entity.dart';

class VendorCard extends StatelessWidget {
  final VendorEntity vendor;
  final bool isDeleting;
  final VoidCallback onDelete;
  final VoidCallback? onView;
  final int? vendorId;

  const VendorCard({
    super.key,
    required this.vendor,
    required this.isDeleting,
    required this.onDelete,
    this.onView,
    this.vendorId,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.brandNeutral200,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Left side - Business Gallery Images
          Container(
            width: 120,
            height: 160,
            decoration: const BoxDecoration(
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(12),
                bottomLeft: Radius.circular(12),
              ),
            ),
            child: Stack(
              children: [
                // Gallery images or placeholder
                ClipRRect(
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(12),
                    bottomLeft: Radius.circular(12),
                  ),
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

          // Right side - Content
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header with ID and status
                  // Row(
                  //   mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  //   children: [
                  //     if (vendorId != null)
                  //       Text(
                  //         'ID: #$vendorId',
                  //         style: const TextStyle(
                  //           color: AppColors.brandNeutral500,
                  //           fontSize: 12,
                  //         ),
                  //       ),
                  //     Container(
                  //       padding: const EdgeInsets.symmetric(
                  //         horizontal: 8,
                  //         vertical: 4,
                  //       ),
                  //       decoration: BoxDecoration(
                  //         color: AppColors.stateGreen100,
                  //         borderRadius: BorderRadius.circular(12),
                  //       ),
                  //       child: const Text(
                  //         'Active',
                  //         style: TextStyle(
                  //           color: AppColors.stateGreen700,
                  //           fontSize: 11,
                  //           fontWeight: FontWeight.w500,
                  //         ),
                  //       ),
                  //     ),
                  //   ],
                  // ),

                  // const SizedBox(height: 8),

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

                  // Listed date
                  Text(
                    'Listed on ${_formatDate(DateTime.now())}',
                    style: const TextStyle(
                      color: AppColors.brandNeutral500,
                      fontSize: 11,
                    ),
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
                            Text(
                              _formatBusinessType(vendor.businessType),
                              style: const TextStyle(
                                color: AppColors.brandNeutral900,
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
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
                            Text(
                              vendor.yearsInBusiness > 0
                                  ? '${vendor.yearsInBusiness} years'
                                  : 'New',
                              style: const TextStyle(
                                color: AppColors.brandNeutral900,
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
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
                            Text(
                              vendor.contactPersonName,
                              style: const TextStyle(
                                color: AppColors.brandNeutral900,
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
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
                            Text(
                              vendor.contactPersonPhone,
                              style: const TextStyle(
                                color: AppColors.brandNeutral900,
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // Action buttons
                  Row(
                    children: [
                      Expanded(
                        child: SizedBox(
                          height: 32,
                          child: OutlinedButton.icon(
                            onPressed: onView,
                            icon: const Icon(
                              Icons.visibility_outlined,
                              size: 14,
                            ),
                            label: const Text(
                              'View',
                              style: TextStyle(fontSize: 12),
                            ),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.brandNeutral700,
                              side: const BorderSide(
                                color: AppColors.brandNeutral300,
                              ),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 4,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
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
          ),
        ],
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
      case 'private limited':
        return 'Private Limited';
      case 'public limited':
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
        decoration: BoxDecoration(
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

    // Show the first image from gallery
    return Image.file(
      File(vendor.businessGallery.first),
      width: double.infinity,
      height: double.infinity,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) {
        return Container(
          width: double.infinity,
          height: double.infinity,
          decoration: BoxDecoration(
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

  String _formatDate(DateTime date) {
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
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }
}
