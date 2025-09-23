import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/app/auth_provider.dart';
import 'package:trees_india/commons/services/phone_service.dart';
import 'package:trees_india/pages/chats_page/app/providers/conversation_usecase_providers.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_vendor_profiles/domain/entities/vendor_entity.dart';
import '../../viewmodels/vendor_state.dart';

class VendorGridWidget extends StatefulWidget {
  final List<VendorEntity> vendors;
  final VendorStatus status;
  final bool hasReachedMax;
  final String? errorMessage;
  final VoidCallback onLoadMore;
  final VoidCallback onRefresh;

  const VendorGridWidget({
    super.key,
    required this.vendors,
    required this.status,
    required this.hasReachedMax,
    this.errorMessage,
    required this.onLoadMore,
    required this.onRefresh,
  });

  @override
  State<VendorGridWidget> createState() => _VendorGridWidgetState();
}

class _VendorGridWidgetState extends State<VendorGridWidget> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_isBottom &&
        !widget.hasReachedMax &&
        widget.status != VendorStatus.loadingMore) {
      widget.onLoadMore();
    }
  }

  bool get _isBottom {
    if (!_scrollController.hasClients) return false;
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.offset;
    return currentScroll >= (maxScroll * 0.9);
  }

  @override
  Widget build(BuildContext context) {
    if (widget.status == VendorStatus.loading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (widget.status == VendorStatus.failure) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline,
                size: 64,
                color: AppColors.stateRed600,
              ),
              const SizedBox(height: AppSpacing.md),
              H4Bold(
                text: 'Something went wrong',
                color: AppColors.brandNeutral900,
              ),
              const SizedBox(height: AppSpacing.sm),
              B2Regular(
                text: widget.errorMessage ?? 'Failed to load vendors',
                color: AppColors.brandNeutral600,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.lg),
              ElevatedButton(
                onPressed: widget.onRefresh,
                child: const Text('Try Again'),
              ),
            ],
          ),
        ),
      );
    }

    if (widget.vendors.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.business_outlined,
                size: 64,
                color: AppColors.brandNeutral400,
              ),
              const SizedBox(height: AppSpacing.md),
              H4Bold(
                text: 'No vendors found',
                color: AppColors.brandNeutral900,
              ),
              const SizedBox(height: AppSpacing.sm),
              B2Regular(
                text: 'Try adjusting your filters to see more results',
                color: AppColors.brandNeutral600,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async => widget.onRefresh(),
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.all(AppSpacing.lg),
        itemCount: widget.vendors.length +
            (widget.status == VendorStatus.loadingMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index >= widget.vendors.length) {
            // Loading indicator
            return const Padding(
              padding: EdgeInsets.all(AppSpacing.lg),
              child: Center(
                child: CircularProgressIndicator(),
              ),
            );
          }

          return Padding(
            padding: EdgeInsets.only(
              bottom: index == widget.vendors.length - 1 ? 0 : AppSpacing.lg,
            ),
            child: _VendorCard(
              vendor: widget.vendors[index],
              onTap: () {
                // Navigate to vendor details page using GoRouter
                context.push('/vendors/${widget.vendors[index].id}');
              },
            ),
          );
        },
      ),
    );
  }
}

class _VendorCard extends ConsumerWidget {
  final VendorEntity vendor;
  final VoidCallback? onTap;

  const _VendorCard({required this.vendor, this.onTap});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.brandNeutral200),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              offset: const Offset(0, 2),
              blurRadius: 8,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with logo and business type
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Row(
                children: [
                  // Logo/Avatar
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: AppColors.brandNeutral100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: vendor.profilePicture.isNotEmpty
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(
                              vendor.profilePicture,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return _buildDefaultLogo();
                              },
                            ),
                          )
                        : _buildDefaultLogo(),
                  ),

                  const SizedBox(width: AppSpacing.sm),

                  // Vendor name and business type
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        H4Bold(
                          text: vendor.vendorName,
                          color: AppColors.brandNeutral900,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            const Icon(
                              Icons.business_outlined,
                              size: 14,
                              color: AppColors.brandNeutral500,
                            ),
                            const SizedBox(width: 4),
                            Expanded(
                              child: B3Regular(
                                text: vendor.yearsInBusiness > 0
                                    ? '${vendor.businessType} • ${vendor.yearsInBusiness} years'
                                    : '${vendor.businessType} • New Business',
                                color: AppColors.brandNeutral600,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
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

            // Services section
            if (vendor.servicesOffered.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    B3Medium(
                      text: 'What we sell',
                      color: AppColors.brandNeutral900,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    _buildServicesChips(),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.md),
            ],

            // Contact info
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Phone
                  if (vendor.contactPersonPhone.isNotEmpty)
                    Row(
                      children: [
                        const Icon(
                          Icons.phone_outlined,
                          size: 16,
                          color: AppColors.brandNeutral500,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: B3Regular(
                            text: PhoneService.formatPhoneNumber(
                                vendor.contactPersonPhone),
                            color: AppColors.brandNeutral700,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),

                  const SizedBox(height: 4),

                  // Location
                  if (vendor.businessAddress.isNotEmpty)
                    Row(
                      children: [
                        const Icon(
                          Icons.location_on_outlined,
                          size: 16,
                          color: AppColors.brandNeutral500,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: B3Regular(
                            text: _formatAddress(vendor.businessAddress),
                            color: AppColors.brandNeutral700,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            ),

            // Background image section (like Bath & Body Works)
            if (vendor.businessGallery.isNotEmpty) ...[
              const SizedBox(height: AppSpacing.md),
              Container(
                height: 80,
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(12),
                    bottomRight: Radius.circular(12),
                  ),
                  image: vendor.businessGallery.first.isNotEmpty
                      ? DecorationImage(
                          image: NetworkImage(vendor.businessGallery.first),
                          fit: BoxFit.cover,
                          colorFilter: ColorFilter.mode(
                            Colors.white.withValues(alpha: 0.7),
                            BlendMode.overlay,
                          ),
                        )
                      : null,
                  color: vendor.businessGallery.first.isEmpty
                      ? AppColors.brandNeutral100
                      : null,
                ),
              ),
            ] else ...[
              const SizedBox(height: AppSpacing.md),
              Container(
                height: 80,
                width: double.infinity,
                decoration: const BoxDecoration(
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(12),
                    bottomRight: Radius.circular(12),
                  ),
                  color: AppColors.brandNeutral100,
                ),
                child: const Center(
                  child: Icon(
                    Icons.image_outlined,
                    size: 32,
                    color: AppColors.brandNeutral400,
                  ),
                ),
              ),
            ],

            // Action buttons
            _buildActionButtons(context, ref),
          ],
        ),
      ),
    );
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

  Widget _buildActionButtons(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final currentUserId = authState.token?.userId;
    final shouldShowChatButton =
        currentUserId != null && currentUserId != vendor.userId.toString();

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(
        children: [
          if (shouldShowChatButton) ...[
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () async {
                  await _createConversationAndNavigate(context, ref, vendor);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.stateGreen600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                icon: const Icon(Icons.chat_bubble_outline, size: 18),
                label: B3Medium(text: 'Chat', color: Colors.white),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
          ],
          Expanded(
            child: OutlinedButton.icon(
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
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.brandNeutral700,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                side: const BorderSide(color: AppColors.brandNeutral300),
              ),
              icon: const Icon(Icons.phone_outlined, size: 18),
              label: B3Medium(text: 'Call', color: AppColors.brandNeutral700),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _createConversationAndNavigate(
    BuildContext context,
    WidgetRef ref,
    VendorEntity vendor,
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

      // Create conversation using the use case
      final createConversationUseCase =
          ref.read(createConversationUseCaseProvider);
      final conversation = await createConversationUseCase.execute(
        user1: int.parse(currentUserId),
        user2: vendor.userId,
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

  String _formatAddress(String fullAddress) {
    try {
      // Parse the JSON string to extract city and state
      final cityMatch = RegExp(r'"city":\s*"([^"]+)"').firstMatch(fullAddress);
      final stateMatch =
          RegExp(r'"state":\s*"([^"]+)"').firstMatch(fullAddress);

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

  Widget _buildDefaultLogo() {
    return const Center(
      child: Icon(
        Icons.business,
        color: AppColors.brandNeutral400,
        size: 24,
      ),
    );
  }
}
