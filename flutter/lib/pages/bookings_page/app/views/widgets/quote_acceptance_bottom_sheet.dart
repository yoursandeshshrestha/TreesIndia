import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:lottie/lottie.dart';
import 'package:trees_india/commons/components/snackbar/app/views/error_snackbar_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/components/skeleton/app/views/skeleton_widget.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/pages/bookings_page/app/viewmodels/bookings_state.dart';
import 'package:trees_india/pages/bookings_page/domain/entities/booking_details_entity.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/wallet/app/providers/wallet_providers.dart';

import '../../providers/bookings_providers.dart';

class QuoteAcceptanceBottomSheet extends ConsumerStatefulWidget {
  final BookingDetailsEntity booking;

  const QuoteAcceptanceBottomSheet({
    super.key,
    required this.booking,
  });

  static Future<void> show(BuildContext context, BookingDetailsEntity booking) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => QuoteAcceptanceBottomSheet(booking: booking),
    );
  }

  @override
  ConsumerState<QuoteAcceptanceBottomSheet> createState() =>
      _QuoteAcceptanceBottomSheetState();
}

class _QuoteAcceptanceBottomSheetState
    extends ConsumerState<QuoteAcceptanceBottomSheet> {
  int _currentStep = 0;
  DateTime? _selectedDate;
  String? _selectedTime;
  String _selectedPaymentMethod = 'razorpay';
  bool showSuccess = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(bookingsNotifierProvider.notifier).loadBookingConfig();
    });
  }

  void _loadWalletData() async {
    try {
      await ref.read(walletNotifierProvider.notifier).loadWalletData();
    } catch (e) {
      // Handle silently
    }
  }

  String _convertTo12HourFormat(String time24) {
    try {
      final parts = time24.split(':');
      int hour = int.parse(parts[0]);
      final minute = parts[1];

      final period = hour >= 12 ? 'PM' : 'AM';
      hour = hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour);

      return '$hour:$minute $period';
    } catch (e) {
      return time24;
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookingsState = ref.watch(bookingsNotifierProvider);

    // Listen for payment success states
    ref.listen<BookingsState>(bookingsNotifierProvider, (previous, current) {
      if (current.isWalletPaymentSuccess || current.isRazorpayPaymentSuccess) {
        // _showSuccessDialog();
        setState(() {
          showSuccess = true;
        });
      }
    });

    if (showSuccess) {
      return _buildSuccessScreen();
    }

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: DraggableScrollableSheet(
        initialChildSize: 0.9,
        minChildSize: 0.5,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) {
          return Column(
            children: [
              _buildHeader(),
              Expanded(
                child: _getCurrentStepWidget(scrollController, bookingsState),
              ),
              _buildBottomButtons(),
            ],
          );
        },
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        children: [
          Container(
            height: 4,
            width: 40,
            decoration: BoxDecoration(
              color: AppColors.brandNeutral300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    H4Bold(
                      text: 'Accept Quote & Schedule Service',
                      color: AppColors.brandNeutral800,
                    ),
                    const SizedBox(height: 4),
                    B3Medium(
                      text:
                          '${widget.booking.service.name} - ${widget.booking.bookingReference}',
                      color: AppColors.brandNeutral600,
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close),
                color: AppColors.brandNeutral600,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          _buildStepIndicator(),
        ],
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Row(
      children: [
        _buildStepDot(0, 'Date & Time'),
        Expanded(child: _buildStepLine(_currentStep > 0)),
        _buildStepDot(1, 'Review & Pay'),
      ],
    );
  }

  Widget _buildStepDot(int stepIndex, String label) {
    final isActive = _currentStep == stepIndex;
    final isCompleted = _currentStep > stepIndex;

    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: isCompleted || isActive
                ? AppColors.brandPrimary600
                : AppColors.brandNeutral300,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: isCompleted
                ? const Icon(
                    Icons.check,
                    color: Colors.white,
                    size: 18,
                  )
                : B4Bold(
                    text: '${stepIndex + 1}',
                    color: isActive ? Colors.white : AppColors.brandNeutral600,
                  ),
          ),
        ),
        const SizedBox(height: 8),
        B4Medium(
          text: label,
          color: isActive || isCompleted
              ? AppColors.brandNeutral800
              : AppColors.brandNeutral500,
        ),
      ],
    );
  }

  Widget _buildStepLine(bool isCompleted) {
    return Container(
      height: 2,
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color:
            isCompleted ? AppColors.brandPrimary600 : AppColors.brandNeutral300,
        borderRadius: BorderRadius.circular(1),
      ),
    );
  }

  Widget _getCurrentStepWidget(
      ScrollController scrollController, BookingsState bookingsState) {
    switch (_currentStep) {
      case 0:
        return _buildDateTimeStep(scrollController, bookingsState);
      case 1:
        return _buildReviewStep(scrollController);
      default:
        return _buildDateTimeStep(scrollController, bookingsState);
    }
  }

  Widget _buildDateTimeStep(
      ScrollController scrollController, BookingsState bookingsState) {
    return SingleChildScrollView(
      controller: scrollController,
      padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: AppSpacing.md),
          _buildDateSelector(bookingsState),
          if (_selectedDate != null) ...[
            const SizedBox(height: AppSpacing.xl),
            _buildTimeSelector(bookingsState),
          ],
        ],
      ),
    );
  }

  Widget _buildDateSelector(BookingsState bookingsState) {
    final daysToShow =
        int.tryParse(bookingsState.bookingConfig?.bookingAdvanceDays ?? '3') ??
            3;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H4Bold(
          text: 'Select Date',
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.md),
        SizedBox(
          height: 80,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: daysToShow,
            itemBuilder: (context, index) {
              final date = DateTime.now().add(Duration(days: index + 1));
              final isSelected = _selectedDate != null &&
                  _selectedDate!.day == date.day &&
                  _selectedDate!.month == date.month &&
                  _selectedDate!.year == date.year;

              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedDate = date;
                    _selectedTime = null; // Reset time when date changes
                  });

                  final formattedDate =
                      '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
                  ref
                      .read(bookingsNotifierProvider.notifier)
                      .loadAvailableSlots(
                          widget.booking.service.id, formattedDate);
                },
                child: Container(
                  width: 70,
                  margin: const EdgeInsets.only(right: AppSpacing.sm),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected
                          ? const Color(0xFF055c3a)
                          : AppColors.brandNeutral200,
                      width: 1,
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      B4Regular(
                        text: [
                          'Sun',
                          'Mon',
                          'Tue',
                          'Wed',
                          'Thu',
                          'Fri',
                          'Sat'
                        ][date.weekday % 7],
                        color: AppColors.brandNeutral500,
                      ),
                      const SizedBox(height: 4),
                      H4Bold(
                        text: date.day.toString(),
                        color: AppColors.brandNeutral900,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildTimeSelector(BookingsState bookingsState) {
    if (bookingsState.isSlotsFetching) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          B2Bold(
            text: 'Select Time',
            color: AppColors.brandNeutral800,
          ),
          const SizedBox(height: AppSpacing.md),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: AppSpacing.sm,
              mainAxisSpacing: AppSpacing.sm,
              childAspectRatio: 2.8,
            ),
            itemCount: 12,
            itemBuilder: (context, index) {
              return SkeletonWidget(
                width: double.infinity,
                height: double.infinity,
                borderRadius: BorderRadius.circular(8),
              );
            },
          ),
        ],
      );
    }

    if (bookingsState.availableSlots?.availableSlots.isEmpty ?? true) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          B2Bold(
            text: 'Select Time',
            color: AppColors.brandNeutral800,
          ),
          const SizedBox(height: AppSpacing.md),
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.stateRed50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.stateRed200),
            ),
            child: B3Regular(
              text: 'No time slots available for this date',
              color: AppColors.stateRed600,
            ),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        B2Bold(
          text: 'Select Time',
          color: AppColors.brandNeutral800,
        ),
        const SizedBox(height: AppSpacing.md),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: AppSpacing.sm,
            mainAxisSpacing: AppSpacing.sm,
            childAspectRatio: 2.8,
          ),
          itemCount: bookingsState.availableSlots!.availableSlots.length,
          itemBuilder: (context, index) {
            final slot = bookingsState.availableSlots!.availableSlots[index];
            final isSelected = _selectedTime == slot.time;
            final isAvailable = slot.isAvailable;
            final displayTime = _convertTo12HourFormat(slot.time);

            return GestureDetector(
              onTap: isAvailable
                  ? () {
                      setState(() {
                        _selectedTime = slot.time;
                      });
                    }
                  : null,
              child: Container(
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.brandPrimary600
                      : isAvailable
                          ? Colors.white
                          : AppColors.brandNeutral50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isSelected
                        ? AppColors.brandPrimary600
                        : isAvailable
                            ? AppColors.brandNeutral200
                            : AppColors.brandNeutral300,
                    width: 1,
                  ),
                ),
                child: Center(
                  child: B3Regular(
                    text: displayTime,
                    color: isSelected
                        ? Colors.white
                        : isAvailable
                            ? AppColors.brandNeutral900
                            : AppColors.brandNeutral400,
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildReviewStep(ScrollController scrollController) {
    // // Load wallet data when entering review step
    // WidgetsBinding.instance.addPostFrameCallback((_) {

    // });

    final walletState = ref.watch(walletNotifierProvider);
    final walletBalance = walletState.walletSummary?.currentBalance ?? 0.0;
    final quoteAmount = widget.booking.quoteAmount ?? 0.0;
    final isWalletSufficient = walletBalance >= quoteAmount;

    return SingleChildScrollView(
      controller: scrollController,
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Booking Summary
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.brandNeutral50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.brandNeutral200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                H4Bold(
                  text: 'Booking Summary',
                  color: AppColors.brandNeutral800,
                ),
                const SizedBox(height: AppSpacing.md),
                _buildSummaryRow('Service', widget.booking.service.name),
                _buildSummaryRow(
                  'Address',
                  '${widget.booking.address.name} - ${widget.booking.address.address}, ${widget.booking.address.city}',
                ),
                _buildSummaryRow(
                  'Date & Time',
                  _selectedDate != null && _selectedTime != null
                      ? '${DateFormat('EEE, MMM dd, yyyy').format(_selectedDate!)} at $_selectedTime'
                      : 'Not selected',
                ),
                _buildSummaryRow(
                  'Quote Amount',
                  '₹${quoteAmount.toStringAsFixed(0)}',
                ),
                const Divider(height: 24, color: AppColors.brandNeutral200),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    B2Bold(
                      text: 'Payable Amount',
                      color: AppColors.brandNeutral800,
                    ),
                    B2Bold(
                      text: '₹${quoteAmount.toStringAsFixed(0)}',
                      color: AppColors.brandNeutral800,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Payment Method Selection
          B2Bold(
            text: 'Payment Method',
            color: AppColors.brandNeutral800,
          ),
          const SizedBox(height: AppSpacing.md),

          // Wallet Payment Option
          _buildPaymentOption(
            method: 'wallet',
            icon: Icons.account_balance_wallet,
            title: 'Pay with Wallet',
            subtitle:
                'Balance: ₹${walletBalance.toStringAsFixed(0)}${isWalletSufficient ? '' : ' (Insufficient)'}',
            iconColor: AppColors.brandPrimary600,
            isEnabled: isWalletSufficient,
          ),

          const SizedBox(height: AppSpacing.md),

          // Razorpay Payment Option
          _buildPaymentOption(
            method: 'razorpay',
            icon: Icons.payment,
            title: 'Pay with Razorpay',
            subtitle: 'Credit/Debit Card, UPI, Net Banking',
            iconColor: Colors.blue,
            isEnabled: true,
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: B3Medium(
              text: label,
              color: AppColors.brandNeutral600,
            ),
          ),
          Expanded(
            child: B3Medium(
              text: value,
              color: AppColors.brandNeutral800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentOption({
    required String method,
    required IconData icon,
    required String title,
    required String subtitle,
    required Color iconColor,
    required bool isEnabled,
  }) {
    final isSelected = _selectedPaymentMethod == method;
    final opacity = isEnabled ? 1.0 : 0.5;

    return GestureDetector(
      onTap: isEnabled
          ? () {
              setState(() {
                _selectedPaymentMethod = method;
              });
            }
          : null,
      child: Opacity(
        opacity: opacity,
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: isSelected
                ? AppColors.brandPrimary50
                : AppColors.brandNeutral100,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected
                  ? AppColors.brandPrimary600
                  : AppColors.brandNeutral200,
            ),
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
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    B3Bold(
                      text: title,
                      color: AppColors.brandNeutral800,
                    ),
                    const SizedBox(height: 2),
                    B4Regular(
                      text: subtitle,
                      color: subtitle.contains('Insufficient')
                          ? AppColors.stateRed600
                          : AppColors.brandNeutral600,
                    ),
                  ],
                ),
              ),
              if (isSelected)
                const Icon(
                  Icons.check_circle,
                  color: AppColors.brandPrimary600,
                  size: 20,
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomButtons() {
    final bookingsState = ref.watch(bookingsNotifierProvider);
    final canContinue = _currentStep == 0
        ? _selectedDate != null && _selectedTime != null
        : true;
    final isLoading = bookingsState.isPaymentProcessing ||
        bookingsState.isSlotsFetching ||
        bookingsState.isConfigLoading;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(color: AppColors.brandNeutral200),
        ),
      ),
      child: Row(
        children: [
          if (_currentStep > 0)
            Expanded(
              child: OutlinedButton(
                onPressed: isLoading
                    ? null
                    : () {
                        setState(() {
                          _currentStep--;
                        });
                      },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.brandNeutral400),
                  foregroundColor: AppColors.brandNeutral700,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text('Back'),
              ),
            ),
          if (_currentStep > 0) const SizedBox(width: AppSpacing.md),
          Expanded(
            child: ElevatedButton(
              onPressed: isLoading || !canContinue
                  ? null
                  : () {
                      if (_currentStep == 0) {
                        _loadWalletData();
                        setState(() {
                          _currentStep++;
                        });
                      } else {
                        _processPayment();
                      }
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.brandPrimary600,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : Text(_currentStep == 0 ? 'Continue' : 'Pay Now'),
            ),
          ),
        ],
      ),
    );
  }

  void _processPayment() async {
    if (_selectedDate == null || _selectedTime == null) return;

    try {
      final scheduledDate =
          '${_selectedDate!.year}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}';
      final amount = widget.booking.quoteAmount?.toInt() ?? 0;

      if (_selectedPaymentMethod == 'wallet') {
        await ref
            .read(bookingsNotifierProvider.notifier)
            .processWalletQuotePayment(
              bookingId: widget.booking.id,
              scheduledDate: scheduledDate,
              scheduledTime: _selectedTime!,
              amount: amount,
            );
      } else {
        // Razorpay payment
        await ref.read(bookingsNotifierProvider.notifier).createQuotePayment(
              bookingId: widget.booking.id,
              scheduledDate: scheduledDate,
              scheduledTime: _selectedTime!,
              amount: amount,
            );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          ErrorSnackbarWidget(
            message: 'Payment failed: ${e.toString()}',
          ).createSnackBar(),
        );
      }
    }
  }

  Widget _buildSuccessScreen() {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Lottie.asset(
              'assets/lottie/success.json',
              width: 120,
              height: 120,
              repeat: false,
            ),
            const SizedBox(height: AppSpacing.xl),
            H3Bold(
              text: 'Payment Successful!',
              color: AppColors.stateGreen600,
            ),
            const SizedBox(height: AppSpacing.md),
            B2Medium(
              text: 'Your quote payment has been processed successfully',
              color: AppColors.brandNeutral600,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.xl),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  // Bookings are already refreshed by the notifier after successful payment
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.stateGreen600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: B2Bold(
                  text: 'Continue',
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
