import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:trees_india/commons/app/auth_provider.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/services/phone_service.dart';
import 'package:trees_india/pages/chats_page/app/providers/conversation_usecase_providers.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_properties/app/views/widgets/property_image_carousel.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_properties/domain/entities/property_entity.dart';
import 'package:trees_india/pages/property_details/app/notifiers/property_details_notifier.dart';

class PropertyDetailsPage extends ConsumerWidget {
  final String propertyId;
  const PropertyDetailsPage({super.key, required this.propertyId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final propertyDetailsState = ref.watch(propertyDetailsNotifierProvider);

    ref.listen<PropertyDetailsState>(propertyDetailsNotifierProvider,
        (previous, next) {
      if (next.status == PropertyDetailsStatus.failure &&
          next.errorMessage != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.errorMessage!),
            backgroundColor: Colors.red,
          ),
        );
      }
    });

    // Fetch vendor details when the page loads or when vendorId changes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Always fetch vendor details for the requested vendorId
      // Check if we're showing a different vendor or no vendor at all
      final currentId = propertyDetailsState.property?.id.toString();
      if (currentId != propertyId ||
          propertyDetailsState.status == PropertyDetailsStatus.initial) {
        ref
            .read(propertyDetailsNotifierProvider.notifier)
            .loadPropertyDetails(propertyId);
      }
    });

    return PopScope(
      onPopInvokedWithResult: (didPop, result) {
        ref.invalidate(propertyDetailsNotifierProvider);
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          title: H3Bold(
            text: propertyDetailsState.property?.title ?? 'Property Details',
            color: AppColors.brandNeutral900,
          ),
          leading: IconButton(
            icon:
                const Icon(Icons.arrow_back, color: AppColors.brandNeutral900),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ),
        body: _buildBody(context, propertyDetailsState, ref),
      ),
    );
  }

  Widget _buildBody(
      BuildContext context, PropertyDetailsState state, WidgetRef ref) {
    switch (state.status) {
      case PropertyDetailsStatus.loading:
        return const Center(
          child: CircularProgressIndicator(
            color: AppColors.brandPrimary500,
          ),
        );
      case PropertyDetailsStatus.success:
        return state.property != null
            ? _buildPropertyDetailsBody(context, state.property!, ref)
            : const Center(child: Text('No vendor data available'));
      case PropertyDetailsStatus.failure:
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline,
                size: 64,
                color: AppColors.error,
              ),
              const SizedBox(height: AppSpacing.lg),
              H3Bold(
                text: 'Error Loading Vendor',
                color: AppColors.brandNeutral900,
              ),
              const SizedBox(height: AppSpacing.sm),
              B2Regular(
                text: state.errorMessage ?? 'Unknown error occurred',
                color: AppColors.brandNeutral600,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        );
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildPropertyDetailsBody(
      BuildContext context, PropertyEntity property, WidgetRef ref) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Scrollable Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title and Address
                  _buildHeaderSection(property),

                  const SizedBox(height: AppSpacing.lg),

                  // Image Carousel
                  _buildImageCarousel(property),

                  const SizedBox(height: AppSpacing.lg),

                  if (property.treesindiaAssured) ...[
                    // Assured Badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.sm,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.transparent,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppColors.stateGreen600),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Image.asset(
                            'assets/logo/logo.png',
                            width: 16,
                            height: 16,
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          const Text(
                            'TreesIndia Assured',
                            style: TextStyle(
                              color: AppColors.stateGreen600,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                  ],

                  // Price Information Section
                  _buildPriceSection(property),

                  const SizedBox(height: AppSpacing.lg),

                  // Property Details
                  _buildPropertyDetails(property),

                  const SizedBox(height: AppSpacing.lg),

                  // Address Card
                  _buildAddressCard(property),

                  const SizedBox(height: AppSpacing.lg),

                  // Description (if available)
                  if (property.description != null &&
                      property.description!.isNotEmpty)
                    _buildDescriptionSection(property),

                  const SizedBox(height: AppSpacing.lg),

                  // Contact Section
                  _buildContactSection(context, property, ref),

                  const SizedBox(height: AppSpacing.lg),

                  // Additional Information
                  _buildAdditionalInformationSection(property),

                  const SizedBox(height: AppSpacing.xl),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderSection(PropertyEntity property) {
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

  Widget _buildImageCarousel(PropertyEntity property) {
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

  Widget _buildPriceSection(PropertyEntity property) {
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

          _buildPriceInfoRow(
              'Listing expires: ${_formatExpirationDate(property.expiresAt)}'),
        ],
      ),
    );
  }

  String _formatExpirationDate(DateTime? expiresAt) {
    if (expiresAt == null) return 'No expiration date';

    // Convert to IST timezone if needed
    final istDateTime = expiresAt.isUtc
        ? expiresAt.add(const Duration(hours: 5, minutes: 30))
        : expiresAt;

    // Format as dd/MM/yyyy
    final formatter = DateFormat('dd/MM/yyyy');
    return formatter.format(istDateTime);
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

  Widget _buildPropertyDetails(PropertyEntity property) {
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

  Widget _buildAddressCard(PropertyEntity property) {
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

  Widget _buildDescriptionSection(PropertyEntity property) {
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

  Widget _buildContactSection(
      BuildContext context, PropertyEntity property, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final currentUserId = authState.token?.userId;
    final shouldShowChatButton = currentUserId != null &&
        property.userId != null &&
        currentUserId != property.userId.toString();

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

          if (shouldShowChatButton) ...[
            const SizedBox(height: AppSpacing.sm),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () async {
                  await _createConversationAndNavigate(context, ref, property);
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.stateGreen600,
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                icon: const Icon(Icons.chat_bubble_outline, size: 18),
                label: const Text(
                  'Send Message',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAdditionalInformationSection(PropertyEntity property) {
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

  Future<void> _createConversationAndNavigate(
    BuildContext context,
    WidgetRef ref,
    PropertyEntity property,
  ) async {
    try {
      // Show loading indicator
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Creating conversation...'),
          duration: Duration(seconds: 1),
        ),
      );

      // Get current user ID from auth state
      final authState = ref.read(authProvider);
      final currentUserId = authState.token?.userId;

      if (currentUserId == null) {
        throw Exception('User not logged in');
      }

      if (property.user == null) {
        throw Exception('Property user not found');
      }

      // Create conversation using the use case
      final createConversationUseCase =
          ref.read(createConversationUseCaseProvider);
      final conversation = await createConversationUseCase.execute(
        user1: int.parse(currentUserId),
        user2: property.user!.id,
      );

      // Navigate to chat room page with the conversation ID
      if (context.mounted) {
        context.push('/conversations/${conversation.id}');
      }
    } catch (e) {
      // Show error message
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to create conversation: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }
}

class _DetailItem {
  final String label;
  final String value;
  final IconData icon;

  _DetailItem(this.label, this.value, this.icon);
}
