import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';
import 'package:trees_india/commons/components/snackbar/app/views/error_snackbar_widget.dart';
import 'package:trees_india/commons/components/snackbar/app/views/info_snackbar_widget.dart';
import 'package:trees_india/commons/components/snackbar/app/views/success_snackbar_widget.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/pages/services_page/domain/entities/service_detail_entity.dart';

import '../../../../../commons/app/user_profile_provider.dart';
import '../../../../../commons/components/button/app/views/outline_button_widget.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../../../commons/widgets/address_selector/app/providers/address_providers.dart';
import '../../../../../commons/widgets/address_selector/app/viewmodels/address_state.dart';
import '../../../../../commons/widgets/address_selector/app/views/widgets/address_list_tile.dart';
import '../../../../../commons/widgets/address_selector/domain/entities/address_entity.dart';
import '../../../../profile_page/app/views/menu_pages/wallet/app/providers/wallet_providers.dart';
import '../../../../services_page/app/providers/service_providers.dart';
import '../../../domain/entities/booking_address_entity.dart';
import '../../../domain/entities/booking_entity.dart';
import '../../providers/booking_providers.dart';
import '../../viewmodels/booking_state.dart';
import 'booking_header_widget.dart';
import 'booking_step_buttons_widget.dart';
import 'booking_summary_widget.dart';
import 'contact_information_widget.dart';
import 'date_selection_widget.dart';
import 'service_details_widget.dart';
import 'step_indicator_widget.dart';
import 'time_slot_selection_widget.dart';

class FixedPriceBookingWidget extends ConsumerStatefulWidget {
  final ServiceDetailEntity service;

  const FixedPriceBookingWidget({
    super.key,
    required this.service,
  });

  @override
  ConsumerState<FixedPriceBookingWidget> createState() =>
      _FixedPriceBookingWidgetState();
}

class _FixedPriceBookingWidgetState
    extends ConsumerState<FixedPriceBookingWidget> {
  int _currentStep = 0;

  // Form controllers
  final _descriptionController = TextEditingController();
  final _contactPersonController = TextEditingController();
  final _contactPhoneController = TextEditingController();
  final _specialInstructionsController = TextEditingController();

  // Selected address from AddressSelectorWidget
  AddressEntity? _selectedAddress;
  DateTime? _selectedDate;
  String? _selectedTime;

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

    // Listen for booking creation and payment success/failure
    ref.listen<BookingState>(bookingNotifierProvider, (previous, next) {
      if (next.status == BookingStatus.success &&
          next.bookingResponse != null) {
        final response = next.bookingResponse!;

        // Check if this is after payment verification (booking confirmed)
        if (response.booking.status == 'confirmed') {
          // Check if it's wallet payment (no payment required after initial call)
          if (response.paymentRequired != true) {
            // This is wallet payment success - show lottie animation
            _showWalletPaymentSuccessDialog();
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SuccessSnackbarWidget(
                message:
                    'Booking confirmed successfully! ID: ${response.booking.bookingReference}',
              ).createSnackBar(),
            );
            context.go('/bookings');
          }
        } else if (response.paymentRequired == true) {
          // Show the temporary hold message
          ScaffoldMessenger.of(context).showSnackBar(
            InfoSnackbarWidget(
              message: response.message,
            ).createSnackBar(),
          );
          // Razorpay will be opened automatically by the notifier
        } else {
          // Booking created without payment requirement or wallet payment success
          if (previous?.bookingResponse?.paymentRequired != true) {
            // This is likely wallet payment success
            _showWalletPaymentSuccessDialog();
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SuccessSnackbarWidget(
                message:
                    'Booking created successfully! ID: ${response.booking.bookingReference}',
              ).createSnackBar(),
            );
            context.go('/bookings');
          }
        }
      } else if (next.status == BookingStatus.failure) {
        ScaffoldMessenger.of(context).showSnackBar(
          ErrorSnackbarWidget(
            message: next.errorMessage ?? 'Failed to create booking',
          ).createSnackBar(),
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
        StepIndicatorWidget(currentStep: _currentStep),

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
          isLoading: _currentStep == 2
              ? ref.watch(bookingNotifierProvider).isLoading
              : false,
        ),
      ],
    );
  }

  Widget _getCurrentStepWidget(BookingState bookingState) {
    switch (_currentStep) {
      case 0:
        return _buildDateTimeStep(bookingState);
      case 1:
        return _buildDetailsStep();
      case 2:
        return _buildReviewStep();
      default:
        return _buildDateTimeStep(bookingState);
    }
  }

  Widget _buildDateTimeStep(BookingState bookingState) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          DateSelectionWidget(
            bookingState: bookingState,
            selectedDate: _selectedDate,
            serviceId: widget.service.id.toString(),
            onDateSelected: (date) {
              setState(() {
                _selectedDate = date;
                _selectedTime = null;
              });
              ref.read(bookingNotifierProvider.notifier).loadAvailableSlots(
                    widget.service.id,
                    '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}',
                  );
            },
          ),
          if (_selectedDate != null) ...[
            const SizedBox(height: AppSpacing.xl),
            TimeSlotSelectionWidget(
              bookingState: bookingState,
              selectedTime: _selectedTime,
              onTimeSelected: (time) {
                setState(() {
                  _selectedTime = time;
                });
                ref.read(bookingNotifierProvider.notifier).selectTimeSlot(time);
              },
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDetailsStep() {
    final userProfile = ref.watch(userProfileProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
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
          BookingSummaryWidget(
            service: widget.service,
            selectedDate: _selectedDate,
            selectedTime: _selectedTime,
            selectedAddress: _selectedAddress,
            contactPerson: _contactPersonController.text,
            contactPhone: _contactPhoneController.text,
            description: _descriptionController.text,
            specialInstructions: _specialInstructionsController.text,
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
        ],
      ),
    );
  }

  void _nextStep() {
    if (_currentStep < 2) {
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

  bool _canContinue() {
    switch (_currentStep) {
      case 0:
        return _selectedDate != null && _selectedTime != null;
      case 1:
        return _selectedAddress != null &&
            _contactPersonController.text.isNotEmpty &&
            _contactPhoneController.text.isNotEmpty;
      case 2:
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
        return 'Review';
      case 2:
        return 'Proceed to Payment';
      default:
        return 'Continue';
    }
  }

  VoidCallback? _getOnContinueCallback() {
    if (!_canContinue()) return null;

    switch (_currentStep) {
      case 0:
      case 1:
        return () => _nextStep();
      case 2:
        return () => _showPaymentOptionsBottomSheet();
      default:
        return null;
    }
  }

  void _createBooking() {
    if (_selectedAddress == null) return;

    final request = CreateBookingRequestEntity(
      serviceId: widget.service.id,
      scheduledDate:
          '${_selectedDate!.year}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}',
      scheduledTime: _selectedTime!,
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

    ref.read(bookingNotifierProvider.notifier).createFixedPriceBooking(request);
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
                  side: BorderSide.none, // Use custom border or none
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

            if (!isAvailable && mounted) {
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
                            _createWalletBooking();
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
                      _createBooking();
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

  void _createWalletBooking() {
    if (_selectedAddress == null) return;

    final request = CreateBookingRequestEntity(
      serviceId: widget.service.id,
      scheduledDate:
          '${_selectedDate!.year}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}',
      scheduledTime: _selectedTime!,
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
        .createFixedPriceBookingWithWallet(request);
  }

  void _showWalletPaymentSuccessDialog() {
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
}
