import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:lottie/lottie.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:trees_india/commons/app/user_profile_provider.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/environment/global_environment.dart';
import 'package:trees_india/pages/bookings_page/domain/entities/booking_details_entity.dart';
import 'package:trees_india/pages/bookings_page/domain/entities/payment_segment_entity.dart';
import 'package:trees_india/pages/bookings_page/domain/entities/segment_payment_request_entity.dart';
import 'package:trees_india/pages/bookings_page/app/providers/bookings_providers.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/wallet/app/providers/wallet_providers.dart';

class SegmentPaymentBottomSheet extends ConsumerStatefulWidget {
  final BookingDetailsEntity booking;
  final bool isFirstSegment;

  const SegmentPaymentBottomSheet({
    super.key,
    required this.booking,
    required this.isFirstSegment,
  });

  static void show(
    BuildContext context,
    BookingDetailsEntity booking,
    bool isFirstSegment,
  ) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => SegmentPaymentBottomSheet(
        booking: booking,
        isFirstSegment: isFirstSegment,
      ),
    );
  }

  @override
  ConsumerState<SegmentPaymentBottomSheet> createState() =>
      _SegmentPaymentBottomSheetState();
}

class _SegmentPaymentBottomSheetState
    extends ConsumerState<SegmentPaymentBottomSheet>
    with SingleTickerProviderStateMixin {
  String? selectedPaymentMethod;
  bool isProcessing = false;
  bool showSuccess = false;

  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Razorpay _razorpay;

  void _loadWalletData() async {
    try {
      await ref.read(walletNotifierProvider.notifier).loadWalletData();
    } catch (e) {
      // Handle silently
    }
  }

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 0.9,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    ));

    _animationController.forward();

    // Initialize Razorpay
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handleSegmentPaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handleSegmentPaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleSegmentExternalWallet);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadWalletData();
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    _razorpay.clear();
    super.dispose();
  }

  PaymentSegmentEntity? get nextSegment {
    final segments = widget.booking.paymentSegments ?? [];
    final pendingSegments = segments
        .where((segment) =>
            segment.status == 'pending' || segment.status == 'overdue')
        .toList();

    if (pendingSegments.isEmpty) return null;

    pendingSegments.sort((a, b) => a.segmentNumber.compareTo(b.segmentNumber));
    return pendingSegments.first;
  }

  double get walletBalance {
    final walletState = ref.watch(walletNotifierProvider);
    final walletBalance = walletState.walletSummary?.currentBalance ?? 0.0;

    return walletBalance;
  }

  bool canPayWithWallet(double amount) {
    return walletBalance >= amount;
  }

  @override
  Widget build(BuildContext context) {
    // Listen to bookings state for segment payment success
    ref.listen(bookingsNotifierProvider, (previous, next) {
      if (next.segmentPaymentSuccess && !showSuccess) {
        setState(() {
          showSuccess = true;
          isProcessing = false;
        });
        // Clear segment payment state after showing success
        Future.delayed(const Duration(milliseconds: 100), () {
          ref.read(bookingsNotifierProvider.notifier).clearSegmentPaymentData();
        });
      }

      if (next.segmentPaymentError != null && mounted) {
        setState(() => isProcessing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Payment failed: ${next.segmentPaymentError}'),
            backgroundColor: AppColors.stateRed600,
          ),
        );
        ref.read(bookingsNotifierProvider.notifier).clearSegmentPaymentData();
      }
    });

    if (showSuccess) {
      return _buildSuccessScreen();
    }

    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: DraggableScrollableSheet(
              initialChildSize: 0.7,
              minChildSize: 0.5,
              maxChildSize: 0.9,
              expand: false,
              builder: (context, scrollController) {
                return Column(
                  children: [
                    _buildHeader(),
                    Expanded(
                      child: SingleChildScrollView(
                        controller: scrollController,
                        padding: const EdgeInsets.all(AppSpacing.lg),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildSegmentInfo(),
                            const SizedBox(height: AppSpacing.xl),
                            _buildPaymentMethodSelection(),
                            const SizedBox(height: AppSpacing.xl),
                            _buildPayButton(),
                          ],
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        );
      },
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
                      text: widget.isFirstSegment
                          ? 'Pay First Segment'
                          : 'Pay Next Segment',
                      color: AppColors.brandNeutral800,
                    ),
                    const SizedBox(height: 4),
                    B3Medium(
                      text:
                          'Booking #${widget.booking.bookingReference} - ${widget.booking.service.name}',
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
        ],
      ),
    );
  }

  Widget _buildSegmentInfo() {
    final segment = nextSegment;
    if (segment == null) {
      return Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: AppColors.stateRed50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.stateRed200),
        ),
        child: Column(
          children: [
            const Icon(
              Icons.error_outline,
              color: AppColors.stateRed600,
              size: 32,
            ),
            const SizedBox(height: AppSpacing.sm),
            B3Bold(
              text: 'No pending segments found',
              color: AppColors.stateRed600,
            ),
          ],
        ),
      );
    }

    final isOverdue = segment.status == 'overdue';

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: widget.isFirstSegment
            ? AppColors.stateGreen50
            : AppColors.brandPrimary50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: widget.isFirstSegment
              ? AppColors.stateGreen200
              : AppColors.brandPrimary200,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  H4Bold(
                    text: widget.isFirstSegment
                        ? 'First Payment'
                        : 'Segment #${segment.segmentNumber}',
                    color: widget.isFirstSegment
                        ? AppColors.stateGreen900
                        : AppColors.brandPrimary900,
                  ),
                  if (widget.isFirstSegment)
                    B3Medium(
                      text: 'Initial payment to start your service',
                      color: AppColors.stateGreen700,
                    )
                  else ...[
                    if (segment.dueDate != null)
                      B3Medium(
                        text:
                            'Due: ${DateFormat('dd/MM/yyyy').format(segment.dueDate!)}',
                        color: AppColors.brandPrimary700,
                      ),
                    if (isOverdue)
                      Row(
                        children: [
                          const Icon(
                            Icons.warning,
                            size: 16,
                            color: AppColors.stateRed600,
                          ),
                          const SizedBox(width: 4),
                          B3Bold(
                            text: 'Overdue',
                            color: AppColors.stateRed600,
                          ),
                        ],
                      ),
                  ],
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  H3Bold(
                    text: '₹${segment.amount.toStringAsFixed(0)}',
                    color: widget.isFirstSegment
                        ? AppColors.stateGreen900
                        : AppColors.brandPrimary900,
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethodSelection() {
    final segment = nextSegment;
    if (segment == null) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H4Bold(
          text: 'Select Payment Method',
          color: AppColors.brandNeutral800,
        ),
        const SizedBox(height: AppSpacing.md),

        // Wallet Payment
        GestureDetector(
          onTap: canPayWithWallet(segment.amount)
              ? () => setState(() => selectedPaymentMethod = 'wallet')
              : null,
          child: Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: selectedPaymentMethod == 'wallet'
                  ? AppColors.stateGreen50
                  : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: selectedPaymentMethod == 'wallet'
                    ? AppColors.stateGreen500
                    : AppColors.brandNeutral200,
                width: selectedPaymentMethod == 'wallet' ? 2 : 1,
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: canPayWithWallet(segment.amount)
                        ? AppColors.brandPrimary100
                        : AppColors.brandNeutral100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.account_balance_wallet_outlined,
                    color: canPayWithWallet(segment.amount)
                        ? AppColors.brandPrimary600
                        : AppColors.brandNeutral400,
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      B2Bold(
                        text: 'Pay with Wallet',
                        color: canPayWithWallet(segment.amount)
                            ? AppColors.brandNeutral800
                            : AppColors.brandNeutral400,
                      ),
                      const SizedBox(height: 2),
                      B3Medium(
                        text: 'Balance: ₹${walletBalance.toStringAsFixed(0)}',
                        color: canPayWithWallet(segment.amount)
                            ? AppColors.brandNeutral600
                            : AppColors.brandNeutral400,
                      ),
                      if (!canPayWithWallet(segment.amount))
                        B4Regular(
                          text: 'Insufficient balance',
                          color: AppColors.stateRed600,
                        ),
                    ],
                  ),
                ),
                if (selectedPaymentMethod == 'wallet')
                  Container(
                    width: 20,
                    height: 20,
                    decoration: const BoxDecoration(
                      color: AppColors.stateGreen600,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check,
                      color: Colors.white,
                      size: 14,
                    ),
                  ),
              ],
            ),
          ),
        ),

        const SizedBox(height: AppSpacing.md),

        // Razorpay Payment
        GestureDetector(
          onTap: () => setState(() => selectedPaymentMethod = 'razorpay'),
          child: Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: selectedPaymentMethod == 'razorpay'
                  ? AppColors.stateGreen50
                  : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: selectedPaymentMethod == 'razorpay'
                    ? AppColors.stateGreen500
                    : AppColors.brandNeutral200,
                width: selectedPaymentMethod == 'razorpay' ? 2 : 1,
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.brandPrimary100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.credit_card,
                    color: AppColors.brandPrimary600,
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      B2Bold(
                        text: 'Pay with Razorpay',
                        color: AppColors.brandNeutral800,
                      ),
                      const SizedBox(height: 2),
                      B3Medium(
                        text: 'Credit/Debit Card, UPI, Net Banking',
                        color: AppColors.brandNeutral600,
                      ),
                    ],
                  ),
                ),
                if (selectedPaymentMethod == 'razorpay')
                  Container(
                    width: 20,
                    height: 20,
                    decoration: const BoxDecoration(
                      color: AppColors.stateGreen600,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check,
                      color: Colors.white,
                      size: 14,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPayButton() {
    final segment = nextSegment;
    if (segment == null || selectedPaymentMethod == null) {
      return const SizedBox.shrink();
    }

    final bookingsState = ref.watch(bookingsNotifierProvider);
    final isLoading = isProcessing || bookingsState.isProcessingSegmentPayment;

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: isLoading ? null : _handlePayment,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.stateGreen600,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: isLoading
            ? Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  B2Bold(
                    text: 'Processing...',
                    color: Colors.white,
                  ),
                ],
              )
            : B2Bold(
                text: 'Pay ₹${segment.amount.toStringAsFixed(0)}',
                color: Colors.white,
              ),
      ),
    );
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
              text: 'Your segment payment has been processed successfully.',
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

  void _handleSegmentPaymentSuccess(PaymentSuccessResponse response) {
    final bookingId = widget.booking.id;
    final bookingsNotifier = ref.read(bookingsNotifierProvider.notifier);

    bookingsNotifier.verifySegmentPayment(
      bookingId: bookingId,
      razorpayPaymentId: response.paymentId ?? '',
      razorpayOrderId: response.orderId ?? '',
      razorpaySignature: response.signature ?? '',
    );
  }

  void _handleSegmentPaymentError(PaymentFailureResponse response) {
    setState(() => isProcessing = false);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content:
              Text('Payment failed: ${response.message ?? 'Unknown error'}'),
          backgroundColor: AppColors.stateRed600,
        ),
      );
    }
  }

  void _handleSegmentExternalWallet(ExternalWalletResponse response) {
    setState(() => isProcessing = false);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('External wallet selected: ${response.walletName}'),
          backgroundColor: AppColors.brandNeutral600,
        ),
      );
    }
  }

  Future<void> _handlePayment() async {
    final segment = nextSegment;
    if (segment == null || selectedPaymentMethod == null) return;

    setState(() => isProcessing = true);
    final bookingsNotifier = ref.read(bookingsNotifierProvider.notifier);

    try {
      final request = SegmentPaymentRequestEntity(
        segmentNumber: segment.segmentNumber,
        amount: segment.amount,
        paymentMethod: selectedPaymentMethod!,
      );

      await bookingsNotifier.createSegmentPayment(
        bookingId: widget.booking.id,
        request: request,
      );

      if (selectedPaymentMethod == 'wallet') {
        // For wallet payments, payment is completed immediately
        setState(() {
          isProcessing = false;
          showSuccess = true;
        });
      } else if (selectedPaymentMethod == 'razorpay') {
        // For Razorpay, get payment order details and launch Razorpay
        final bookingsState = ref.read(bookingsNotifierProvider);
        final paymentOrder =
            bookingsState.quotePaymentResponse?.data.paymentOrder;

        if (paymentOrder != null) {
          setState(() => isProcessing = false);

          // Launch Razorpay with order details
          await _launchRazorpay(paymentOrder);
        } else {
          throw Exception('Failed to create payment order');
        }
      }
    } catch (e) {
      setState(() => isProcessing = false);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Payment failed: ${e.toString()}'),
            backgroundColor: AppColors.stateRed600,
          ),
        );
      }
    }
  }

  Future<void> _launchRazorpay(dynamic paymentOrder) async {
    final userProfile = ref.read(userProfileProvider).user;
    final phoneNumber = userProfile?.phone ?? '';

    final options = {
      'key': GlobalEnvironment.razorpayKey,
      'amount': paymentOrder.amount,
      'currency': paymentOrder.currency,
      'order_id': paymentOrder.id,
      'receipt': paymentOrder.receipt,
      'name': 'Trees India',
      'description': 'Segment Payment',
      'prefill': {'contact': phoneNumber, 'email': userProfile?.email ?? ''}
    };

    try {
      _razorpay.open(options);
    } catch (error) {
      setState(() => isProcessing = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to open payment gateway: $error'),
            backgroundColor: AppColors.stateRed600,
          ),
        );
      }
    }
  }
}
