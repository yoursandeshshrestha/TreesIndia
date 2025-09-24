import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/services/phone_service.dart';
import '../../../domain/entities/property_entity.dart';
import 'property_image_carousel.dart';
// import 'delete_confirmation_bottom_sheet.dart';

class PropertyDetailBottomSheet extends StatelessWidget {
  final PropertyEntity property;
  final VoidCallback onDelete;
  final bool isDeleting;

  const PropertyDetailBottomSheet({
    super.key,
    required this.property,
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

          // Header with close button and delete action
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              children: [
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(
                    Icons.close,
                    color: AppColors.brandNeutral600,
                  ),
                ),
                const Spacer(),
                if (isDeleting)
                  const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                else
                  IconButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                      onDelete();
                    },
                    icon: const Icon(
                      Icons.delete_outline,
                      color: AppColors.error,
                    ),
                  ),
              ],
            ),
          ),

          // Scrollable Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title and Address
                  _buildHeaderSection(),

                  const SizedBox(height: AppSpacing.lg),

                  // Image Carousel
                  _buildImageCarousel(),

                  const SizedBox(height: AppSpacing.lg),

                  // Price Information Section
                  _buildPriceSection(),

                  const SizedBox(height: AppSpacing.lg),

                  // Property Details
                  _buildPropertyDetails(),

                  const SizedBox(height: AppSpacing.lg),

                  // Address Card
                  _buildAddressCard(),

                  const SizedBox(height: AppSpacing.lg),

                  // Description (if available)
                  if (property.description != null &&
                      property.description!.isNotEmpty)
                    _buildDescriptionSection(),

                  const SizedBox(height: AppSpacing.lg),

                  // Contact Section
                  _buildContactSection(),

                  const SizedBox(height: AppSpacing.lg),

                  // Additional Information
                  _buildAdditionalInformationSection(),

                  const SizedBox(height: AppSpacing.xl),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H1Medium(
          text: property.title,
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.sm),
        if (property.address != null && property.address!.isNotEmpty)
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
                  property.address!,
                  style: const TextStyle(
                    fontSize: 16,
                    color: AppColors.brandNeutral600,
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
      ],
    );
  }

  Widget _buildImageCarousel() {
    if (property.images.isEmpty) {
      return Container(
        height: 250,
        width: double.infinity,
        decoration: BoxDecoration(
          color: AppColors.brandNeutral100,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.home_outlined,
              size: 64,
              color: AppColors.brandNeutral400,
            ),
            SizedBox(height: AppSpacing.md),
            Text(
              'No Images Available',
              style: TextStyle(
                color: AppColors.brandNeutral500,
                fontSize: 16,
              ),
            ),
          ],
        ),
      );
    }

    return PropertyImageCarousel(images: property.images);
  }

  Widget _buildPriceSection() {
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
          Row(
            children: [
              Icon(
                property.listingType == 'rent'
                    ? Icons.calendar_month_outlined
                    : Icons.sell_outlined,
                size: 20,
                color: AppColors.stateGreen600,
              ),
              const SizedBox(width: AppSpacing.sm),
              Text(
                property.listingType == 'rent'
                    ? 'Rental Information'
                    : 'Sale Information',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.brandNeutral900,
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Price
          H2Bold(
            text: property.displayPrice,
            color: AppColors.brandNeutral900,
          ),

          const SizedBox(height: AppSpacing.sm),

          // Price Details
          Row(
            children: [
              if (property.priceNegotiable) ...[
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.brandPrimary50,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'Price Negotiable',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.brandPrimary600,
                    ),
                  ),
                ),
              ] else ...[
                const Text(
                  'Fixed Price',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.brandNeutral600,
                  ),
                ),
              ],
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Additional Price Info
          _buildPriceInfoRow(
            property.listingType == 'rent'
                ? 'Monthly rent: ${property.displayPrice}'
                : 'Sale price: ${property.displayPrice}',
          ),

          _buildPriceInfoRow('Listing expires: 18/10/2025'),
        ],
      ),
    );
  }

  Widget _buildPriceInfoRow(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.xs),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 4,
            decoration: const BoxDecoration(
              color: AppColors.brandNeutral400,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Text(
            text,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.brandNeutral700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPropertyDetails() {
    final details = [
      _DetailItem('Status', property.displayStatus, Icons.alarm),
      if (property.displayArea != 'Area not specified')
        _DetailItem('Area', property.displayArea, Icons.square_foot),
      if (property.bedrooms != null)
        _DetailItem('Bedrooms', '${property.bedrooms}', Icons.bed_outlined),
      if (property.bathrooms != null)
        _DetailItem(
            'Bathrooms', '${property.bathrooms}', Icons.bathtub_outlined),
      if (property.propertyType.isNotEmpty)
        _DetailItem(
            'Property Type', property.displayPropertyType, Icons.home_outlined),
      if (property.floorNumber != null)
        _DetailItem('Floor', '${property.floorNumber}', Icons.layers_outlined),
      if (property.displayAge != 'Age not specified')
        _DetailItem('Age', property.displayAge, Icons.schedule_outlined),
      if (property.furnishingStatus != null &&
          property.furnishingStatus!.isNotEmpty)
        _DetailItem(
            'Furnishing', property.furnishingStatus!, Icons.chair_outlined),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Property Details',
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
              Icon(
                Icons.location_on_outlined,
                size: 20,
                color: AppColors.stateGreen600,
              ),
              SizedBox(width: AppSpacing.sm),
              Text(
                'Location',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.brandNeutral900,
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Address Information
          if (property.address != null && property.address!.isNotEmpty)
            _buildAddressInfoRow('Address:', property.address!),

          if (property.city.isNotEmpty)
            _buildAddressInfoRow('City:', property.city),

          if (property.state.isNotEmpty)
            _buildAddressInfoRow('State:', property.state),

          if (property.pincode != null && property.pincode!.isNotEmpty)
            _buildAddressInfoRow('Pincode:', property.pincode!),
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
            width: 80,
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

  Widget _buildDescriptionSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Description',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.brandNeutral900,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.brandNeutral50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.brandNeutral200),
          ),
          child: Text(
            property.description!,
            style: const TextStyle(
              fontSize: 15,
              color: AppColors.brandNeutral700,
              height: 1.5,
            ),
          ),
        ),
      ],
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
          if (property.user != null && property.user!.name.isNotEmpty) ...[
            Text(
              'Owner: ${property.user!.name}',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: AppColors.brandNeutral800,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
          ],

          // Call Button
          if (property.user != null)
            SizedBox(
              width: double.infinity,
              child: Builder(
                builder: (context) => ElevatedButton.icon(
                  onPressed: () async {
                    if (property.user!.phone != null &&
                        property.user!.phone!.isNotEmpty) {
                      final bool callInitiated =
                          await PhoneService.makePhoneCall(
                        property.user!.phone!,
                      );
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
                    padding:
                        const EdgeInsets.symmetric(vertical: AppSpacing.md),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  icon: const Icon(Icons.phone, size: 18),
                  label: Text(
                    'Call Owner ${property.user!.phone}',
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

  Widget _buildAdditionalInformationSection() {
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
          const Text(
            'Additional Information',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.brandNeutral900,
            ),
          ),

          const SizedBox(height: AppSpacing.md),

          // Property ID
          _buildAdditionalInfoRow('Property ID:', '#${property.id}'),

          // Listed On
          _buildAdditionalInfoRow(
            'Listed on:',
            '${property.createdAt.day.toString().padLeft(2, '0')}/'
                '${property.createdAt.month.toString().padLeft(2, '0')}/'
                '${property.createdAt.year}',
          ),

          // Status
          _buildAdditionalInfoRow(
            'Status:',
            property.displayStatus,
            statusColor: property.displayStatusColor,
          ),
        ],
      ),
    );
  }

  Widget _buildAdditionalInfoRow(String label, String value,
      {Color? statusColor}) {
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
                color: AppColors.brandNeutral600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: statusColor ?? AppColors.brandNeutral800,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailItem {
  final String label;
  final String value;
  final IconData icon;

  _DetailItem(this.label, this.value, this.icon);
}
