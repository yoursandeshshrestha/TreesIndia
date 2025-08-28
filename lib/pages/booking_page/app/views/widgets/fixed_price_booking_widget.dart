import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/components/snackbar/app/views/error_snackbar_widget.dart';
import 'package:trees_india/commons/components/snackbar/app/views/info_snackbar_widget.dart';
import 'package:trees_india/commons/components/snackbar/app/views/success_snackbar_widget.dart';
import 'package:trees_india/pages/services_page/domain/entities/service_detail_entity.dart';

import '../../../../../commons/constants/app_spacing.dart';
import '../../../../../commons/widgets/address_selector/app/views/address_selector_widget.dart';
import '../../../../../commons/widgets/address_selector/domain/entities/address_entity.dart';
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
  void dispose() {
    _descriptionController.dispose();
    _contactPersonController.dispose();
    _contactPhoneController.dispose();
    _specialInstructionsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bookingState = ref.watch(bookingNotifierProvider);

    // Listen for booking creation and payment success/failure
    ref.listen<BookingState>(bookingNotifierProvider, (previous, next) {
      if (next.status == BookingStatus.success &&
          next.bookingResponse != null) {
        final response = next.bookingResponse!;

        // Check if this is after payment verification (booking confirmed)
        if (response.booking.status == 'confirmed') {
          ScaffoldMessenger.of(context).showSnackBar(
            SuccessSnackbarWidget(
              message:
                  'Booking confirmed successfully! ID: ${response.booking.bookingReference}',
            ).createSnackBar(),
          );
          context.go('/bookings');
        } else if (response.paymentRequired == true) {
          // Show the temporary hold message
          ScaffoldMessenger.of(context).showSnackBar(
            InfoSnackbarWidget(
              message: response.message,
            ).createSnackBar(),
          );
          // Razorpay will be opened automatically by the notifier
        } else {
          // Booking created without payment requirement
          ScaffoldMessenger.of(context).showSnackBar(
            SuccessSnackbarWidget(
              message:
                  'Booking created successfully! ID: ${response.booking.bookingReference}',
            ).createSnackBar(),
          );
          context.go('/bookings');
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
        const Divider(height: 1),

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
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AddressSelectorWidget(
            title: 'Service Address',
            selectedAddress: _selectedAddress,
            onAddressSelected: (address) async {
              setState(() {
                _selectedAddress = address;
              });

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
                setState(() {
                  _selectedAddress = null;
                });
              }
            },
          ),
          const SizedBox(height: AppSpacing.xl),
          ContactInformationWidget(
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
            _contactPhoneController.text.isNotEmpty &&
            _descriptionController.text.isNotEmpty;
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
        return 'Book Now - ₹${widget.service.price}';
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
        return () => _createBooking();
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
      description: _descriptionController.text,
      contactPerson: _contactPersonController.text,
      contactPhone: _contactPhoneController.text,
      specialInstructions: _specialInstructionsController.text.isNotEmpty
          ? _specialInstructionsController.text
          : null,
    );

    ref.read(bookingNotifierProvider.notifier).createFixedPriceBooking(request);
  }
}
