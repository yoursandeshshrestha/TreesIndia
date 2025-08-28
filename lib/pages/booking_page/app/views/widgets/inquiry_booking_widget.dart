import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/components/button/app/views/solid_button_widget.dart';
import '../../../../../commons/components/textfield/app/views/alphabetic_textfield_widget.dart';
import '../../../../../commons/components/textfield/app/views/numeric_textfield_widget.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../../../commons/widgets/address_selector/app/views/address_selector_widget.dart';
import '../../../../../commons/widgets/address_selector/domain/entities/address_entity.dart';
import 'package:trees_india/pages/services_page/domain/entities/service_detail_entity.dart';
import '../../../domain/entities/booking_address_entity.dart';
import '../../../domain/entities/booking_entity.dart';
import '../../providers/booking_providers.dart';
import '../../viewmodels/booking_state.dart';

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
  final PageController _pageController = PageController();
  int _currentStep = 0;

  // Form controllers
  final _descriptionController = TextEditingController();
  final _contactPersonController = TextEditingController();
  final _contactPhoneController = TextEditingController();
  final _specialInstructionsController = TextEditingController();

  // Selected address from AddressSelectorWidget
  AddressEntity? _selectedAddress;

  @override
  void dispose() {
    _pageController.dispose();
    _descriptionController.dispose();
    _contactPersonController.dispose();
    _contactPhoneController.dispose();
    _specialInstructionsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bookingState = ref.watch(bookingNotifierProvider);

    // Listen for inquiry creation success/failure
    ref.listen<BookingState>(bookingNotifierProvider, (previous, next) {
      if (next.status == BookingStatus.success &&
          next.bookingResponse != null) {
        if (next.bookingResponse!.paymentOrder != null) {
          // TODO: Navigate to payment screen for inquiry fee
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content:
                  Text('Inquiry created! Please complete payment to proceed.'),
              backgroundColor: Colors.orange,
            ),
          );
        } else {
          // No payment required, inquiry submitted successfully
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                  'Inquiry submitted successfully! ID: ${next.bookingResponse!.booking.id}'),
              backgroundColor: Colors.green,
            ),
          );
        }
        Navigator.pop(context);
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
        Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Row(
            children: [
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    H3Bold(
                      text: 'Submit Inquiry for ${widget.service.name}',
                      color: AppColors.brandNeutral900,
                    ),
                    if (bookingState.bookingConfig?.inquiryBookingFee != null)
                      B3Regular(
                        text:
                            'Inquiry fee: ₹${bookingState.bookingConfig!.inquiryBookingFee}',
                        color: AppColors.brandNeutral600,
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const Divider(height: 1),

        // Step Indicator
        Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Row(
            children: [
              _buildStepIndicator(0, 'Details', _currentStep >= 0),
              const Expanded(child: Divider()),
              _buildStepIndicator(1, 'Review', _currentStep >= 1),
            ],
          ),
        ),

        // Content
        Expanded(
          child: PageView(
            controller: _pageController,
            onPageChanged: (index) {
              setState(() {
                _currentStep = index;
              });
            },
            children: [
              _buildDetailsStep(),
              _buildReviewStep(bookingState),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStepIndicator(int step, String label, bool isActive) {
    return Column(
      children: [
        Container(
          width: 30,
          height: 30,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isActive
                ? AppColors.brandPrimary600
                : AppColors.brandNeutral200,
          ),
          child: Center(
            child: B3Bold(
              text: '${step + 1}',
              color: isActive ? Colors.white : AppColors.brandNeutral600,
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        B4Regular(
          text: label,
          color:
              isActive ? AppColors.brandPrimary600 : AppColors.brandNeutral600,
        ),
      ],
    );
  }

  Widget _buildDetailsStep() {
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

          AddressSelectorWidget(
            title: 'Service Address',
            selectedAddress: _selectedAddress,
            onAddressSelected: (address) async {
              setState(() {
                _selectedAddress = address;
              });

              // Check service availability for the selected address
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

          H4Bold(
            text: 'Contact Information',
            color: AppColors.brandNeutral900,
          ),
          const SizedBox(height: AppSpacing.md),

          AlphabeticTextfieldWidget(
            hintText: 'Contact Person Name',
            onTextChanged: (value) {
              setState(() {
                _contactPersonController.text = value;
              });
            },
          ),
          const SizedBox(height: AppSpacing.md),

          NumericTextfieldWidget(
            hintText: 'Contact Phone',
            onTextChanged: (value) {
              setState(() {
                _contactPhoneController.text = value;
              });
            },
          ),
          const SizedBox(height: AppSpacing.xl),

          H4Bold(
            text: 'Service Requirements',
            color: AppColors.brandNeutral900,
          ),
          const SizedBox(height: AppSpacing.md),

          AlphabeticTextfieldWidget(
            hintText: 'Describe your requirements in detail',
            onTextChanged: (value) {
              setState(() {
                _descriptionController.text = value;
              });
            },
          ),
          const SizedBox(height: AppSpacing.md),

          AlphabeticTextfieldWidget(
            hintText: 'Additional Notes (Optional)',
            onTextChanged: (value) {
              setState(() {
                _specialInstructionsController.text = value;
              });
            },
          ),

          const SizedBox(height: AppSpacing.xl),
          Row(
            children: [
              Expanded(
                child: SolidButtonWidget(
                  label: 'Review Inquiry',
                  onPressed: _isDetailsValid() ? () => _nextStep() : null,
                  isLoading: false,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildReviewStep(BookingState bookingState) {
    final inquiryFee = bookingState.bookingConfig?.inquiryBookingFee;

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
            padding: const EdgeInsets.all(AppSpacing.lg),
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
                B3Regular(
                  text:
                      'Category: ${widget.service.categoryName} > ${widget.service.subcategoryName}',
                  color: AppColors.brandNeutral600,
                ),
                if (inquiryFee != null) ...[
                  const SizedBox(height: AppSpacing.sm),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      B2Regular(
                        text: 'Inquiry Fee:',
                        color: AppColors.brandNeutral700,
                      ),
                      B1Bold(
                        text: '₹$inquiryFee',
                        color: AppColors.brandPrimary700,
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.lg),

          // Address Information
          if (_selectedAddress != null)
            _buildInfoSection('Service Address', [
              _selectedAddress!.name,
              _selectedAddress!.fullAddress,
            ]),

          const SizedBox(height: AppSpacing.lg),

          // Contact Information
          _buildInfoSection('Contact Information', [
            _contactPersonController.text,
            _contactPhoneController.text,
          ]),

          const SizedBox(height: AppSpacing.lg),

          // Requirements
          _buildInfoSection('Service Requirements', [
            _descriptionController.text,
          ]),

          if (_specialInstructionsController.text.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.lg),
            _buildInfoSection('Additional Notes', [
              _specialInstructionsController.text,
            ]),
          ],

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

          const SizedBox(height: AppSpacing.xl),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => _previousStep(),
                  child: const Text('Back'),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: SolidButtonWidget(
                  label: inquiryFee != null
                      ? 'Submit & Pay ₹$inquiryFee'
                      : 'Submit Inquiry',
                  onPressed: () => _submitInquiry(),
                  isLoading: bookingState.isLoading,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoSection(String title, List<String> info) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.brandNeutral200),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          B2Bold(
            text: title,
            color: AppColors.brandNeutral900,
          ),
          const SizedBox(height: AppSpacing.sm),
          ...info.map((text) => Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.xs),
                child: B3Regular(
                  text: text,
                  color: AppColors.brandNeutral700,
                ),
              )),
        ],
      ),
    );
  }

  void _nextStep() {
    if (_currentStep < 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  bool _isDetailsValid() {
    print('selectedAddress: $_selectedAddress');
    print('contactPerson: ${_contactPersonController.text}');
    print('contactPhone: ${_contactPhoneController.text}');
    print('description: ${_descriptionController.text}');
    print('specialInstructions: ${_specialInstructionsController.text}');

    return _selectedAddress != null &&
        _contactPersonController.text.isNotEmpty &&
        _contactPhoneController.text.isNotEmpty &&
        _descriptionController.text.isNotEmpty;
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
      description: _descriptionController.text,
      contactPerson: _contactPersonController.text,
      contactPhone: _contactPhoneController.text,
      specialInstructions: _specialInstructionsController.text.isNotEmpty
          ? _specialInstructionsController.text
          : null,
    );

    ref.read(bookingNotifierProvider.notifier).createInquiryBooking(request);
  }
}
