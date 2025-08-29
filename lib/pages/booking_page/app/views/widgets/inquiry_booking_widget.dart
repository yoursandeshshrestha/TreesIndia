import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';
import 'package:trees_india/commons/components/snackbar/app/views/info_snackbar_widget.dart';
import 'package:trees_india/pages/booking_page/app/views/widgets/booking_info_section_widget.dart';
import 'package:trees_india/pages/booking_page/app/views/widgets/inquiry_step_indicator_widget.dart';
import 'package:trees_india/pages/booking_page/app/views/widgets/service_details_widget.dart';
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
        const Divider(height: 1),

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
                  child: OutlinedButtonWidget(
                    label: 'Select Address',
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
        return () => _submitInquiry();
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

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
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
                  Expanded(
                    child: _buildAddressListContent(
                        addressState, scrollController),
                  ),
                ],
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildAddressListContent(
      AddressState addressState, ScrollController scrollController) {
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

            if (!mounted) return;

            if (!isAvailable) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Service not available at this address'),
                  backgroundColor: Colors.red,
                ),
              );
              return;
            }

            setState(() {
              _selectedAddress = address;
            });
            Navigator.pop(context);
          },
        );
      },
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
            ref.read(bookingNotifierProvider.notifier).clearState();
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
}
