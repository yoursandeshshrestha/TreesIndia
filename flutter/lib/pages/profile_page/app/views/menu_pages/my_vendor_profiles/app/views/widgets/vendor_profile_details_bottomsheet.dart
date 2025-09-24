import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/services/phone_service.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_vendor_profiles/app/views/widgets/vendor_image_carousel.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_vendor_profiles/domain/entities/vendor_entity.dart';

class VendorProfileDetailsBottomSheet extends StatelessWidget {
  final VendorEntity vendor;
  final VoidCallback onDelete;
  final bool isDeleting;

  const VendorProfileDetailsBottomSheet({
    super.key,
    required this.vendor,
    required this.onDelete,
    this.isDeleting = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      decoration: const BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag Handle
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(top: AppSpacing.sm),
            decoration: BoxDecoration(
              color: AppColors.brandNeutral300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md, vertical: AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildVendorHeader(),
                  const SizedBox(height: AppSpacing.lg),
                  _buildImageGallery(),
                  const SizedBox(height: AppSpacing.lg),
                  _buildBusinessDetails(),
                  const SizedBox(height: AppSpacing.lg),
                  _buildServicesOffered(),
                  const SizedBox(height: AppSpacing.lg),
                  _buildAddressCard(),
                  const SizedBox(height: AppSpacing.lg),
                  _buildContactSection(),
                  const SizedBox(height: AppSpacing.lg),
                  if (vendor.businessDescription.isNotEmpty) ...[
                    _buildBusinessDescription(),
                    const SizedBox(height: AppSpacing.lg)
                  ],
                  _buildActionButtons(context),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImageGallery() {
    if (vendor.businessGallery.isEmpty) {
      return Container(
        height: 250,
        width: double.infinity,
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
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.business,
                color: Colors.white,
                size: 64,
              ),
              SizedBox(height: 8),
              Text(
                'No images available',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return VendorImageCarousel(images: vendor.businessGallery);
  }

  Widget _buildVendorHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H1Medium(
          text: vendor.vendorName,
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.sm),
        Row(
          children: [
            const Icon(
              Icons.location_on,
              size: 16,
              color: AppColors.brandNeutral500,
            ),
            const SizedBox(width: AppSpacing.xs),
            Expanded(
              child: Text(
                _extractLocationFromAddress(vendor.businessAddress),
                style: const TextStyle(
                  color: AppColors.brandNeutral600,
                  fontSize: 16,
                  height: 1.4,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: vendor.isActive
                ? AppColors.stateGreen100
                : AppColors.brandNeutral100,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Text(
            vendor.isActive ? 'Active' : 'Inactive',
            style: TextStyle(
              color: vendor.isActive
                  ? AppColors.stateGreen700
                  : AppColors.brandNeutral600,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBusinessDetails() {
    final details = [
      _DetailItem('Business Type', _formatBusinessType(vendor.businessType),
          Icons.home_outlined),
      _DetailItem(
          'Experience',
          vendor.yearsInBusiness > 0
              ? '${vendor.yearsInBusiness} years'
              : 'New business',
          Icons.schedule_outlined),
      _DetailItem('Status', vendor.isActive ? "Active" : "Inactive",
          Icons.person_outline),
      _DetailItem('Posted on', _formatDate(DateTime.parse(vendor.createdAt)),
          Icons.calendar_month_outlined),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Vendor Details',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.brandNeutral900,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        ...details.map((detail) => _buildDetailRow(detail)),
      ],
    );
  }

  Widget _buildDetailRow(_DetailItem detail) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: AppColors.brandNeutral100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              detail.icon,
              size: 20,
              color: AppColors.brandNeutral600,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  detail.label,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.brandNeutral500,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs / 2),
                Text(
                  detail.value,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.brandNeutral800,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.brandNeutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title
          const Row(
            children: [
              Icon(
                Icons.person_outline,
                size: 20,
                color: AppColors.brandNeutral700,
              ),
              SizedBox(width: AppSpacing.sm),
              Text(
                'Contact',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.brandNeutral900,
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Owner Name
          Text(
            'Owner: ${vendor.contactPersonName}',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
              color: AppColors.brandNeutral800,
            ),
          ),

          const SizedBox(height: AppSpacing.md),

          // Call Button
          SizedBox(
            width: double.infinity,
            child: Builder(
              builder: (context) => ElevatedButton.icon(
                onPressed: () async {
                  if (vendor.contactPersonPhone.isNotEmpty) {
                    final bool callInitiated = await PhoneService.makePhoneCall(
                      vendor.contactPersonPhone,
                    );

                    if (context.mounted) {
                      String message;
                      Color backgroundColor;

                      if (callInitiated) {
                        message = 'Calling ${vendor.vendorName}...';
                        backgroundColor = Colors.green;
                      } else {
                        message =
                            'Unable to make phone call. This feature requires a real device with phone capability.';
                        backgroundColor = Colors.orange;
                      }

                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(message),
                          backgroundColor: backgroundColor,
                          duration: const Duration(seconds: 3),
                        ),
                      );
                    }
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Phone number not available'),
                        backgroundColor: Colors.orange,
                      ),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.stateGreen600,
                  foregroundColor: AppColors.white,
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                icon: const Icon(Icons.phone, size: 18),
                label: Text(
                  'Call ${PhoneService.formatPhoneNumber(vendor.contactPersonPhone)}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServicesOffered() {
    if (vendor.servicesOffered.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'What we sell',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.brandNeutral900,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: vendor.servicesOffered.map((service) {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.stateGreen50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.stateGreen200),
              ),
              child: Text(
                service,
                style: const TextStyle(
                  color: AppColors.stateGreen700,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildAddressCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.brandNeutral50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.brandNeutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title
          const Row(
            children: [
              Text(
                'Business Location',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.brandNeutral900,
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          _buildAddressInfoRow(
              'Address:', _parseFullAddress(vendor.businessAddress)),
        ],
      ),
    );
  }

  Widget _buildAddressInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppColors.brandNeutral600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.brandNeutral800,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBusinessDescription() {
    if (vendor.businessDescription.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H3Bold(
          text: 'Business Description',
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: 12),
        Text(
          vendor.businessDescription,
          style: const TextStyle(
            color: AppColors.brandNeutral700,
            fontSize: 14,
            height: 1.5,
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: isDeleting
                ? null
                : () {
                    Navigator.pop(context);
                    onDelete();
                  },
            icon: isDeleting
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                    ),
                  )
                : const Icon(Icons.delete_outline),
            label: Text(isDeleting ? 'Deleting...' : 'Delete Profile'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.stateRed600,
              side: const BorderSide(color: AppColors.stateRed300),
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(4.0),
              ),
            ),
          ),
        ),
      ],
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

  String _extractLocationFromAddress(String businessAddress) {
    try {
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

  String _parseFullAddress(String businessAddress) {
    try {
      final streetMatch =
          RegExp(r'"street":\s*"([^"]+)"').firstMatch(businessAddress);
      final cityMatch =
          RegExp(r'"city":\s*"([^"]+)"').firstMatch(businessAddress);
      final stateMatch =
          RegExp(r'"state":\s*"([^"]+)"').firstMatch(businessAddress);
      final pincodeMatch =
          RegExp(r'"pincode":\s*"([^"]+)"').firstMatch(businessAddress);
      final landmarkMatch =
          RegExp(r'"landmark":\s*"([^"]+)"').firstMatch(businessAddress);

      final street = streetMatch?.group(1) ?? '';
      final city = cityMatch?.group(1) ?? '';
      final state = stateMatch?.group(1) ?? '';
      final pincode = pincodeMatch?.group(1) ?? '';
      final landmark = landmarkMatch?.group(1) ?? '';

      final parts = <String>[];
      if (street.isNotEmpty) parts.add(street);
      if (landmark.isNotEmpty) parts.add(landmark);
      if (city.isNotEmpty) parts.add(city);
      if (state.isNotEmpty) parts.add(state);
      if (pincode.isNotEmpty) parts.add(pincode);

      return parts.isNotEmpty ? parts.join(', ') : 'Address not available';
    } catch (e) {
      return 'Address not available';
    }
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

class _DetailItem {
  final String label;
  final String value;
  final IconData icon;

  _DetailItem(this.label, this.value, this.icon);
}
