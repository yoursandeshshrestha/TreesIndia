import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/commons/components/snackbar/app/views/error_snackbar_widget.dart';
import 'package:trees_india/commons/components/snackbar/app/views/info_snackbar_widget.dart';
import 'package:trees_india/commons/components/snackbar/app/views/success_snackbar_widget.dart';
import 'package:trees_india/commons/presenters/providers/location_onboarding_provider.dart';
import 'package:trees_india/commons/utils/open_custom_bottom_sheet.dart';
import 'package:trees_india/pages/booking_page/app/views/widgets/booking_info_section_widget.dart';
import 'package:trees_india/pages/booking_page/app/views/widgets/inquiry_step_indicator_widget.dart';
import 'package:trees_india/pages/booking_page/app/views/widgets/service_details_widget.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/wallet/app/providers/wallet_providers.dart';
import 'package:trees_india/pages/services_page/app/providers/service_providers.dart';
import 'package:trees_india/pages/services_page/domain/entities/service_detail_entity.dart';

import '../../../../../commons/app/user_profile_provider.dart';
import '../../../../../commons/components/button/app/views/outline_button_widget.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../../../commons/widgets/address_selector/app/providers/address_providers.dart';
import '../../../../../commons/widgets/address_selector/app/viewmodels/address_state.dart';
import '../../../../../commons/widgets/address_selector/app/views/widgets/address_list_tile.dart';
import '../../../../../commons/widgets/address_selector/domain/entities/address_entity.dart';
import '../../../domain/entities/booking_address_entity.dart';
import '../../../domain/entities/booking_entity.dart';
import '../../providers/booking_providers.dart';
import '../../viewmodels/booking_state.dart';
import 'booking_header_widget.dart';
import 'booking_step_buttons_widget.dart';
import 'contact_information_widget.dart';

class InquiryBookingWidget extends ConsumerStatefulWidget {
  final ServiceDetailEntity service;

  const InquiryBookingWidget({
    super.key,
    required this.service,
  });

  @override
  ConsumerState<InquiryBookingWidget> createState() =>
      _InquiryBookingWidgetState();
}

class _InquiryBookingWidgetState extends ConsumerState<InquiryBookingWidget> {
  int _currentStep = 0;

  // Form controllers
  final _descriptionController = TextEditingController();
  final _contactPersonController = TextEditingController();
  final _contactPhoneController = TextEditingController();
  final _specialInstructionsController = TextEditingController();

  // Selected address from AddressSelectorWidget
  AddressEntity? _selectedAddress;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadUserProfile();
    });
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    _contactPersonController.dispose();
    _contactPhoneController.dispose();
    _specialInstructionsController.dispose();
    super.dispose();
  }

  void _loadUserProfile() {
    ref.read(userProfileProvider.notifier).loadUserProfile();
    final userProfile = ref.read(userProfileProvider);

    if (userProfile.user != null) {
      _contactPersonController.text = userProfile.user?.name ?? '';
      _contactPhoneController.text = userProfile.user?.phone ?? '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookingState = ref.watch(bookingNotifierProvider);

    // Listen for user profile changes to update contact information
    ref.listen<UserProfileState>(userProfileProvider, (previous, next) {
      if (next.user != null && (previous?.user != next.user)) {
        if (mounted) {
          setState(() {
            if (_contactPersonController.text.isEmpty) {
              _contactPersonController.text = next.user?.name ?? '';
            }
            if (_contactPhoneController.text.isEmpty) {
              _contactPhoneController.text = next.user?.phone ?? '';
            }
          });
        }
      }
    });

    // Listen for inquiry creation success/failure
    ref.listen<BookingState>(bookingNotifierProvider, (previous, next) {
      if (next.status == BookingStatus.success) {
        // Case 1: Initial inquiry creation with payment required
        if (next.inquiryBookingResponse != null) {
          final response = next.inquiryBookingResponse!;

          if (response.paymentRequired == true) {
            ScaffoldMessenger.of(context).showSnackBar(
              const InfoSnackbarWidget(
                message: 'Inquiry created! Payment in progress...',
              ).createSnackBar(),
            );
            // Payment will be handled automatically by Razorpay
          } else {
            _showPaymentSuccessDialog();
          }
        }
        // Case 2: Payment verification completed (inquiryBookingResponse is null, bookingResponse is set)
        else if (next.bookingResponse != null &&
            previous?.inquiryBookingResponse != null) {
          _showPaymentSuccessDialog();
        }
        // Case 3: Wallet payment completed (inquiryBookingResponse is null, bookingResponse is set, no previous inquiryBookingResponse)
        else if (next.bookingResponse != null &&
            next.inquiryBookingResponse == null &&
            previous?.inquiryBookingResponse == null) {
          _showPaymentSuccessDialog();
        }
      } else if (next.status == BookingStatus.failure) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.errorMessage ?? 'Failed to submit inquiry'),
            backgroundColor: Colors.red,
          ),
        );
      }
    });

    return Column(
      children: [
        // Header
        BookingHeaderWidget(service: widget.service),
        Container(
          height: 1,
          color: AppColors.brandNeutral100,
        ),

        // Step Indicator
        InquiryStepIndicatorWidget(currentStep: _currentStep),

        // Content
        Expanded(
          child: _getCurrentStepWidget(bookingState),
        ),

        // Bottom Buttons
        BookingStepButtonsWidget(
          currentStep: _currentStep,
          onBack: _currentStep > 0 ? () => _previousStep() : null,
          onContinue: _getOnContinueCallback(),
          canContinue: _canContinue(),
          continueLabel: _getContinueLabel(),
          isLoading: _currentStep == 1
              ? ref.watch(bookingNotifierProvider).isLoading
              : false,
        ),
      ],
    );
  }

  Widget _getCurrentStepWidget(BookingState bookingState) {
    switch (_currentStep) {
      case 0:
        return _buildDetailsStep();
      case 1:
        return _buildReviewStep();
      default:
        return _buildDetailsStep();
    }
  }

  Widget _buildDetailsStep() {
    final userProfile = ref.watch(userProfileProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Info Card
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.brandPrimary50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.brandPrimary200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.info_outline,
                      color: AppColors.brandPrimary600,
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    B2Bold(
                      text: 'How it works',
                      color: AppColors.brandPrimary700,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                B3Regular(
                  text: '1. Submit your inquiry with requirements\n'
                      '2. Pay inquiry fee (if applicable)\n'
                      '3. Admin will review and provide a quote\n'
                      '4. Accept quote and schedule service',
                  color: AppColors.brandNeutral700,
                ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.xl),

          ContactInformationWidget(
            initialContactPerson:
                userProfile.user?.name ?? _contactPersonController.text,
            initialContactPhone:
                userProfile.user?.phone ?? _contactPhoneController.text,
            onContactPersonChanged: (value) {
              setState(() {
                _contactPersonController.text = value;
              });
            },
            onContactPhoneChanged: (value) {
              setState(() {
                _contactPhoneController.text = value;
              });
            },
          ),
          const SizedBox(height: AppSpacing.xl),

          H4Bold(
            text: 'Service Address',
          ),
          const SizedBox(height: AppSpacing.md),
          if (_selectedAddress != null)
            _buildSelectedAddressCard()
          else
            Row(
              children: [
                Expanded(
                  child: SolidButtonWidget(
                    label: 'Select Address',
                    labelColor: AppColors.white,
                    backgroundColor: AppColors.stateGreen700,
                    onPressed: () => _showAddressSelectionBottomSheet(),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildReviewStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          H4Bold(
            text: 'Inquiry Summary',
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
                  text: widget.service.name,
                  color: AppColors.brandNeutral900,
                ),
                const SizedBox(height: AppSpacing.sm),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    B2Regular(
                      text: 'Inquiry Fee:',
                      color: AppColors.brandNeutral700,
                    ),
                    B1Bold(
                      text:
                          '₹${ref.watch(bookingNotifierProvider).bookingConfig?.inquiryBookingFee}',
                      color: AppColors.brandPrimary700,
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.lg),

          // Address Information
          if (_selectedAddress != null)
            BookingInfoSectionWidget(
              title: 'Service Address',
              info: [
                _selectedAddress!.name,
                _selectedAddress!.fullAddress,
              ],
            ),

          const SizedBox(height: AppSpacing.lg),

          // Contact Information
          BookingInfoSectionWidget(
            title: 'Contact Information',
            info: [
              _contactPersonController.text,
              _contactPhoneController.text,
            ],
          ),

          const SizedBox(height: AppSpacing.xl),
          ServiceDetailsWidget(
            onDescriptionChanged: (value) {
              setState(() {
                _descriptionController.text = value;
              });
            },
            onSpecialInstructionsChanged: (value) {
              setState(() {
                _specialInstructionsController.text = value;
              });
            },
          ),

          const SizedBox(height: AppSpacing.xl),
          // Disclaimer
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: Colors.amber.shade50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.amber.shade200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.schedule,
                        color: Colors.amber.shade700, size: 20),
                    const SizedBox(width: AppSpacing.sm),
                    B3Bold(
                      text: 'What happens next?',
                      color: Colors.amber.shade700,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                B4Regular(
                  text:
                      'Our admin will review your requirements and provide a personalized quote within 24 hours. You can then accept or decline the quote.',
                  color: Colors.amber.shade800,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _nextStep() {
    if (_currentStep < 1) {
      setState(() {
        _currentStep++;
      });
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() {
        _currentStep--;
      });
    }
  }

  void _submitInquiry() {
    if (_selectedAddress == null) return;

    final request = CreateInquiryBookingRequestEntity(
      serviceId: widget.service.id,
      address: BookingAddressEntity(
        name: _selectedAddress!.name,
        address: _selectedAddress!.address,
        city: _selectedAddress!.city,
        state: _selectedAddress!.state,
        country: _selectedAddress!.country,
        postalCode: _selectedAddress!.postalCode,
        latitude: _selectedAddress!.latitude,
        longitude: _selectedAddress!.longitude,
      ),
      description: _descriptionController.text.isNotEmpty
          ? _descriptionController.text
          : null,
      contactPerson: _contactPersonController.text,
      contactPhone: _contactPhoneController.text,
      specialInstructions: _specialInstructionsController.text.isNotEmpty
          ? _specialInstructionsController.text
          : null,
    );

    ref.read(bookingNotifierProvider.notifier).createInquiryBooking(request);
  }

  void _submitInquiryWallet() {
    if (_selectedAddress == null) return;

    final request = CreateInquiryBookingRequestEntity(
      serviceId: widget.service.id,
      address: BookingAddressEntity(
        name: _selectedAddress!.name,
        address: _selectedAddress!.address,
        city: _selectedAddress!.city,
        state: _selectedAddress!.state,
        country: _selectedAddress!.country,
        postalCode: _selectedAddress!.postalCode,
        latitude: _selectedAddress!.latitude,
        longitude: _selectedAddress!.longitude,
      ),
      description: _descriptionController.text.isNotEmpty
          ? _descriptionController.text
          : null,
      contactPerson: _contactPersonController.text,
      contactPhone: _contactPhoneController.text,
      specialInstructions: _specialInstructionsController.text.isNotEmpty
          ? _specialInstructionsController.text
          : null,
    );

    ref
        .read(bookingNotifierProvider.notifier)
        .createInquiryBookingWithWallet(request);
  }

  bool _canContinue() {
    switch (_currentStep) {
      case 0:
        return _selectedAddress != null &&
            _contactPersonController.text.isNotEmpty &&
            _contactPhoneController.text.isNotEmpty;
      case 1:
        return true;
      default:
        return false;
    }
  }

  String _getContinueLabel() {
    switch (_currentStep) {
      case 0:
        return 'Continue';
      case 1:
        return 'Submit Inquiry';
      default:
        return 'Continue';
    }
  }

  VoidCallback? _getOnContinueCallback() {
    if (!_canContinue()) return null;

    switch (_currentStep) {
      case 0:
        return () => _nextStep();
      case 1:
        return () => _showPaymentOptionsBottomSheet();
      // return () => _submitInquiry();
      default:
        return null;
    }
  }

  Widget _buildSelectedAddressCard() {
    if (_selectedAddress == null) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: const Color(0xFFE5E7EB),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                B2Bold(
                  text: _selectedAddress!.name,
                  color: const Color(0xFF111827),
                ),
                const SizedBox(height: AppSpacing.xs),
                B3Regular(
                  text: _selectedAddress!.fullAddress,
                  color: const Color(0xFF6B7280),
                  maxLines: 2,
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          SizedBox(
            height: 24,
            child: ElevatedButton(
              onPressed: () => _showAddressSelectionBottomSheet(),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 0, vertical: 0),
                backgroundColor: AppColors.brandNeutral300,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  side: BorderSide.none,
                ),
              ),
              child: B5Medium(
                text: 'Change',
                color: AppColors.brandNeutral800,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showAddressSelectionBottomSheet() {
    ref.read(addressNotifierProvider.notifier).loadAddresses();
    final rootContext = context; // Store root context for snackbar

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (bottomSheetContext) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) {
          return Consumer(
            builder: (context, ref, child) {
              final addressState = ref.watch(addressNotifierProvider);

              return Column(
                children: [
                  Container(
                    padding: const EdgeInsets.fromLTRB(
                        AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, 0),
                    child: Column(
                      children: [
                        Container(
                          height: 4,
                          width: 40,
                          decoration: BoxDecoration(
                            color: const Color(0xFFE5E7EB),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.lg),
                        Row(
                          children: [
                            H4Bold(text: 'Saved Addresses'),
                            const Spacer(),
                            IconButton(
                              onPressed: () => Navigator.pop(context),
                              icon: const Icon(Icons.close),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  // Add Another Address Button
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.lg,
                      vertical: AppSpacing.md,
                    ),
                    decoration: const BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: AppColors.brandNeutral100,
                          width: 1,
                        ),
                      ),
                    ),
                    child: GestureDetector(
                      onTap: () {
                        _showAddAddressBottomSheet(
                            bottomSheetContext, rootContext);
                      },
                      child: const Row(
                        children: [
                          Icon(
                            Icons.add,
                            color: Color(0xFF055c3a),
                            size: 20,
                          ),
                          SizedBox(width: AppSpacing.md),
                          Text(
                            'Add another address',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                              color: Color(0xFF055c3a),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Expanded(
                    child: _buildAddressListContent(
                        addressState, scrollController, rootContext),
                  ),
                ],
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildAddressListContent(AddressState addressState,
      ScrollController scrollController, BuildContext rootContext) {
    if (addressState.status == AddressStatus.loading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (addressState.status == AddressStatus.failure) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 48,
              color: Colors.red,
            ),
            const SizedBox(height: AppSpacing.md),
            B3Regular(
              text: addressState.errorMessage ?? 'Failed to load addresses',
              color: Colors.red,
            ),
            const SizedBox(height: AppSpacing.lg),
            OutlinedButtonWidget(
              label: 'Retry',
              onPressed: () =>
                  ref.read(addressNotifierProvider.notifier).loadAddresses(),
            ),
          ],
        ),
      );
    }

    if (addressState.addresses.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.location_off,
              size: 48,
              color: Color(0xFF9CA3AF),
            ),
            const SizedBox(height: AppSpacing.md),
            H4Bold(
              text: 'No addresses found',
              color: const Color(0xFF6B7280),
            ),
            const SizedBox(height: AppSpacing.sm),
            B3Regular(
              text: 'Add your first address to continue',
              color: const Color(0xFF9CA3AF),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      controller: scrollController,
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: addressState.addresses.length,
      separatorBuilder: (context, index) =>
          const SizedBox(height: AppSpacing.sm),
      itemBuilder: (context, index) {
        final address = addressState.addresses[index];
        final isSelected = _selectedAddress?.id == address.id;

        return AddressListTile(
          address: address,
          isSelected: isSelected,
          onTap: () async {
            final isAvailable = await ref
                .read(bookingNotifierProvider.notifier)
                .checkServiceAvailability(
                    widget.service.id, address.city, address.state);

            if (!isAvailable) {
              if (mounted) {
                // Close the bottom sheet first
                Navigator.pop(context);
              }
              // Show snackbar on root context so it appears above bottom sheet
              if (rootContext.mounted) {
                ScaffoldMessenger.of(rootContext).showSnackBar(
                  ErrorSnackbarWidget(
                    message:
                        'This service is not available in your selected location (${address.city}, ${address.state}). Please select another address.',
                  ).createSnackBar(),
                );
              }
              return;
            }

            if (mounted) {
              setState(() {
                _selectedAddress = address;
              });
              Navigator.pop(context);
            }
          },
        );
      },
    );
  }

  void _showAddAddressBottomSheet(
      BuildContext bottomSheetContext, BuildContext rootContext) {
    final TextEditingController nameController = TextEditingController();
    final TextEditingController addressController = TextEditingController();
    final TextEditingController cityController = TextEditingController();
    final TextEditingController stateController = TextEditingController();
    final TextEditingController pincodeController = TextEditingController();
    final TextEditingController houseNumberController = TextEditingController();
    final TextEditingController landmarkController = TextEditingController();
    bool isLoadingLocation = false;
    double? fetchedLatitude;
    double? fetchedLongitude;

    openCustomBottomSheet(
      context: bottomSheetContext,
      child: StatefulBuilder(
        builder: (context, setState) => Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  H3Medium(
                    text: 'Add New Address',
                    color: AppColors.brandNeutral900,
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close),
                    color: AppColors.brandNeutral600,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              // Use Current Location Button
              Consumer(
                builder: (context, ref, child) {
                  return SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: isLoadingLocation
                          ? null
                          : () async {
                              setState(() {
                                isLoadingLocation = true;
                              });

                              try {
                                final locationService =
                                    ref.read(locationOnboardingServiceProvider);
                                final location =
                                    await locationService.getCurrentLocation();

                                if (context.mounted) {
                                  setState(() {
                                    cityController.text = location.city ?? '';
                                    stateController.text = location.state ?? '';
                                    pincodeController.text =
                                        location.postalCode ?? '';
                                    addressController.text = location.address;
                                    fetchedLatitude = location.latitude;
                                    fetchedLongitude = location.longitude;
                                    isLoadingLocation = false;
                                  });

                                  if (rootContext.mounted) {
                                    ScaffoldMessenger.of(rootContext)
                                        .showSnackBar(
                                      const SuccessSnackbarWidget(
                                        message:
                                            'Location fetched successfully!',
                                      ).createSnackBar(),
                                    );
                                  }
                                }
                              } catch (e) {
                                if (context.mounted) {
                                  setState(() {
                                    isLoadingLocation = false;
                                  });

                                  if (rootContext.mounted) {
                                    ScaffoldMessenger.of(rootContext)
                                        .showSnackBar(
                                      ErrorSnackbarWidget(
                                        message:
                                            'Failed to get location: ${e.toString()}',
                                      ).createSnackBar(),
                                    );
                                  }
                                }
                              }
                            },
                      icon: isLoadingLocation
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                    Color(0xFF055c3a)),
                              ),
                            )
                          : const Icon(
                              Icons.my_location,
                              size: 18,
                            ),
                      label: Text(
                        isLoadingLocation
                            ? 'Fetching location...'
                            : 'Use Current Location',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF055c3a),
                        side: const BorderSide(
                          color: Color(0xFF055c3a),
                          width: 1,
                        ),
                        padding: const EdgeInsets.symmetric(
                          vertical: AppSpacing.md,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: AppSpacing.lg),

              // City
              TextField(
                controller: cityController,
                decoration: InputDecoration(
                  hintText: 'City',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(
                        color: AppColors.brandNeutral200, width: 1),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        const BorderSide(color: Color(0xFF055c3a), width: 1),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(
                        color: AppColors.brandNeutral200, width: 1),
                  ),
                ),
                onTapOutside: (_) => FocusScope.of(context).unfocus(),
              ),
              const SizedBox(height: AppSpacing.md),

              // State
              TextField(
                controller: stateController,
                decoration: InputDecoration(
                  hintText: 'State',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(
                        color: AppColors.brandNeutral200, width: 1),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        const BorderSide(color: Color(0xFF055c3a), width: 1),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(
                        color: AppColors.brandNeutral200, width: 1),
                  ),
                ),
                onTapOutside: (_) => FocusScope.of(context).unfocus(),
              ),
              const SizedBox(height: AppSpacing.md),

              // Pincode
              TextField(
                controller: pincodeController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  hintText: 'Pincode',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(
                        color: AppColors.brandNeutral200, width: 1),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        const BorderSide(color: Color(0xFF055c3a), width: 1),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(
                        color: AppColors.brandNeutral200, width: 1),
                  ),
                ),
                onTapOutside: (_) => FocusScope.of(context).unfocus(),
              ),
              const SizedBox(height: AppSpacing.md),

              // Full Address
              TextField(
                controller: addressController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Enter your complete address',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(
                        color: AppColors.brandNeutral200, width: 1),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        const BorderSide(color: Color(0xFF055c3a), width: 1),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(
                        color: AppColors.brandNeutral200, width: 1),
                  ),
                ),
                onTapOutside: (_) => FocusScope.of(context).unfocus(),
              ),
              const SizedBox(height: AppSpacing.md),

              // House/Flat Number
              TextField(
                controller: houseNumberController,
                decoration: InputDecoration(
                  hintText: 'House/Flat Number',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(
                        color: AppColors.brandNeutral200, width: 1),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        const BorderSide(color: Color(0xFF055c3a), width: 1),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(
                        color: AppColors.brandNeutral200, width: 1),
                  ),
                ),
                onTapOutside: (_) => FocusScope.of(context).unfocus(),
              ),
              const SizedBox(height: AppSpacing.md),

              // Landmark
              TextField(
                controller: landmarkController,
                decoration: InputDecoration(
                  hintText: 'Landmark',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(
                        color: AppColors.brandNeutral200, width: 1),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        const BorderSide(color: Color(0xFF055c3a), width: 1),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(
                        color: AppColors.brandNeutral200, width: 1),
                  ),
                ),
                onTapOutside: (_) => FocusScope.of(context).unfocus(),
              ),
              const SizedBox(height: AppSpacing.md),

              // Address Label
              const Text(
                'Address Label',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppColors.brandNeutral700,
                ),
              ),
              const SizedBox(height: AppSpacing.md),

              // Predefined options
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          nameController.text = 'Home';
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          vertical: AppSpacing.sm,
                          horizontal: AppSpacing.md,
                        ),
                        decoration: BoxDecoration(
                          color: nameController.text == 'Home'
                              ? const Color(0xFF055c3a)
                              : Colors.white,
                          border: Border.all(
                            color: nameController.text == 'Home'
                                ? const Color(0xFF055c3a)
                                : AppColors.brandNeutral300,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Home',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: nameController.text == 'Home'
                                ? Colors.white
                                : AppColors.brandNeutral600,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          nameController.text = 'Work';
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          vertical: AppSpacing.sm,
                          horizontal: AppSpacing.md,
                        ),
                        decoration: BoxDecoration(
                          color: nameController.text == 'Work'
                              ? const Color(0xFF055c3a)
                              : Colors.white,
                          border: Border.all(
                            color: nameController.text == 'Work'
                                ? const Color(0xFF055c3a)
                                : AppColors.brandNeutral300,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Work',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: nameController.text == 'Work'
                                ? Colors.white
                                : AppColors.brandNeutral600,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          nameController.text = 'Other';
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          vertical: AppSpacing.sm,
                          horizontal: AppSpacing.md,
                        ),
                        decoration: BoxDecoration(
                          color: nameController.text == 'Other'
                              ? const Color(0xFF055c3a)
                              : Colors.white,
                          border: Border.all(
                            color: nameController.text == 'Other'
                                ? const Color(0xFF055c3a)
                                : AppColors.brandNeutral300,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Other',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: nameController.text == 'Other'
                                ? Colors.white
                                : AppColors.brandNeutral600,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              // Custom input field when "Other" is selected
              if (nameController.text == 'Other') ...[
                const SizedBox(height: AppSpacing.md),
                TextField(
                  controller: nameController,
                  decoration: InputDecoration(
                    hintText: 'Enter custom label',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                          color: AppColors.brandNeutral200, width: 1),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide:
                          const BorderSide(color: Color(0xFF055c3a), width: 1),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                          color: AppColors.brandNeutral200, width: 1),
                    ),
                  ),
                  onTapOutside: (_) => FocusScope.of(context).unfocus(),
                ),
              ],
              const SizedBox(height: AppSpacing.lg),

              // Add Address Button
              Consumer(
                builder: (context, ref, child) {
                  final addressState = ref.watch(addressNotifierProvider);

                  return SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: addressState.isCreating
                          ? null
                          : () async {
                              // Validate all required fields
                              if (nameController.text.isNotEmpty &&
                                  addressController.text.isNotEmpty &&
                                  cityController.text.isNotEmpty &&
                                  stateController.text.isNotEmpty &&
                                  pincodeController.text.isNotEmpty) {
                                try {
                                  // Create address request
                                  final createAddressRequest =
                                      CreateAddressRequestEntity(
                                    name: nameController.text,
                                    address: addressController.text,
                                    city: cityController.text,
                                    state: stateController.text,
                                    country: 'India', // Default country
                                    postalCode: pincodeController.text,
                                    latitude: fetchedLatitude ?? 0.0,
                                    longitude: fetchedLongitude ?? 0.0,
                                    houseNumber:
                                        houseNumberController.text.isNotEmpty
                                            ? houseNumberController.text
                                            : null,
                                    landmark: landmarkController.text.isNotEmpty
                                        ? landmarkController.text
                                        : null,
                                    isDefault: false, // Default to false
                                  );

                                  // Call the API to create address
                                  await ref
                                      .read(addressNotifierProvider.notifier)
                                      .createAddress(createAddressRequest);

                                  // Close the add address bottom sheet
                                  if (context.mounted) {
                                    Navigator.pop(context);
                                  }

                                  // Show success message on root context
                                  if (rootContext.mounted) {
                                    ScaffoldMessenger.of(rootContext)
                                        .showSnackBar(
                                      const SuccessSnackbarWidget(
                                        message: 'Address added successfully!',
                                      ).createSnackBar(),
                                    );
                                  }

                                  // Refresh the address list
                                  ref
                                      .read(addressNotifierProvider.notifier)
                                      .loadAddresses();
                                } catch (e) {
                                  // Show error message on root context
                                  if (rootContext.mounted) {
                                    ScaffoldMessenger.of(rootContext)
                                        .showSnackBar(
                                      ErrorSnackbarWidget(
                                        message:
                                            'Failed to add address: ${e.toString()}',
                                      ).createSnackBar(),
                                    );
                                  }
                                }
                              } else {
                                // Show validation error on root context
                                if (rootContext.mounted) {
                                  ScaffoldMessenger.of(rootContext)
                                      .showSnackBar(
                                    const ErrorSnackbarWidget(
                                      message:
                                          'Please fill all required fields',
                                    ).createSnackBar(),
                                  );
                                }
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: addressState.isCreating
                            ? AppColors.brandNeutral400
                            : const Color(0xFF055c3a),
                        foregroundColor: Colors.white,
                        padding:
                            const EdgeInsets.symmetric(vertical: AppSpacing.md),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: addressState.isCreating
                          ? const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.white),
                                  ),
                                ),
                                SizedBox(width: AppSpacing.sm),
                                Text(
                                  'Adding Address...',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            )
                          : const Text(
                              'Add Address',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  );
                },
              ),
              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }

  void _showPaymentSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        // Auto-redirect after 2 seconds
        Future.delayed(const Duration(seconds: 4), () {
          if (mounted && Navigator.canPop(dialogContext)) {
            // Clear and invalidate notifiers
            ref.read(bookingNotifierProvider.notifier).reset();
            ref.invalidate(bookingNotifierProvider);
            ref.invalidate(serviceNotifierProvider);

            Navigator.of(dialogContext).pop();
            if (mounted) {
              context.go('/bookings');
            }
          }
        });

        return AlertDialog(
          contentPadding: EdgeInsets.zero,
          backgroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          content: Container(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  height: 120,
                  width: 120,
                  child: Lottie.asset(
                    'assets/lottie/success.json',
                    repeat: false,
                  ),
                ),
                const SizedBox(height: 24),
                H4Bold(
                  text: 'Payment Successful!',
                  color: AppColors.brandPrimary700,
                ),
                const SizedBox(height: 12),
                B2Regular(
                  text: 'Your booking has been confirmed successfully.',
                  color: const Color(0xFF6B7280),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showPaymentOptionsBottomSheet() async {
    // Load wallet summary first
    try {
      ref.read(bookingNotifierProvider.notifier).startLoading();
      await ref.read(walletNotifierProvider.notifier).loadWalletData();
    } catch (e) {
      // Handle error silently, will show default balance in UI
    } finally {
      ref.read(bookingNotifierProvider.notifier).stopLoading();
    }

    if (!mounted) return;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Consumer(
          builder: (context, ref, child) {
            final walletState = ref.watch(walletNotifierProvider);
            final walletBalance =
                walletState.walletSummary?.currentBalance ?? 0.0;
            final servicePrice = widget.service.price?.toDouble() ?? 0.0;
            final isWalletSufficient = walletBalance >= servicePrice;

            return Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      height: 4,
                      width: 40,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE5E7EB),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  H4Bold(text: 'Choose Payment Method'),
                  const SizedBox(height: 24),

                  // Wallet Payment Option
                  _buildPaymentOption(
                    icon: Icons.account_balance_wallet,
                    title: 'Pay with Wallet',
                    subtitle:
                        'Balance: ₹${walletBalance.toStringAsFixed(0)}${isWalletSufficient ? '' : ' (Insufficient)'}',
                    onTap: isWalletSufficient
                        ? () {
                            Navigator.pop(context);
                            _submitInquiryWallet();
                          }
                        : null,
                    iconColor: AppColors.brandPrimary700,
                    isEnabled: isWalletSufficient,
                  ),

                  const SizedBox(height: 16),

                  // Razorpay Payment Option
                  _buildPaymentOption(
                    icon: Icons.payment,
                    title: 'Pay with Razorpay',
                    subtitle: 'Credit/Debit Card, UPI, Net Banking',
                    onTap: () {
                      Navigator.pop(context);
                      _submitInquiry();
                    },
                    iconColor: Colors.blue,
                    isEnabled: true,
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildPaymentOption({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback? onTap,
    required Color iconColor,
    required bool isEnabled,
  }) {
    final opacity = isEnabled ? 1.0 : 0.5;

    return InkWell(
      onTap: isEnabled ? onTap : null,
      borderRadius: BorderRadius.circular(12),
      child: Opacity(
        opacity: opacity,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border.all(
              color: isEnabled
                  ? const Color(0xFFE5E7EB)
                  : const Color(0xFFE5E7EB).withValues(alpha: 0.5),
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  icon,
                  color: iconColor,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    B2Bold(
                      text: title,
                      color: const Color(0xFF111827),
                    ),
                    const SizedBox(height: 4),
                    B3Regular(
                      text: subtitle,
                      color: subtitle.contains('Insufficient')
                          ? Colors.red
                          : const Color(0xFF6B7280),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: isEnabled
                    ? const Color(0xFF9CA3AF)
                    : const Color(0xFF9CA3AF).withValues(alpha: 0.5),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
