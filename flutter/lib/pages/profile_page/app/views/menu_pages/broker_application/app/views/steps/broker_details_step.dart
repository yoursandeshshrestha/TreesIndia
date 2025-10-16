import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/app/views/widgets/worker_form_field.dart';
import '../../providers/broker_application_providers.dart';

class BrokerDetailsStep extends ConsumerStatefulWidget {
  const BrokerDetailsStep({super.key});

  @override
  ConsumerState<BrokerDetailsStep> createState() => _BrokerDetailsStepState();
}

class _BrokerDetailsStepState extends ConsumerState<BrokerDetailsStep> {
  late final TextEditingController _licenseNumberController;
  late final TextEditingController _agencyNameController;

  final Map<String, String?> _errors = {};

  @override
  void initState() {
    super.initState();
    _licenseNumberController = TextEditingController();
    _agencyNameController = TextEditingController();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeFormData();
    });
  }

  void _initializeFormData() {
    final brokerState = ref.read(brokerApplicationNotifierProvider);
    final brokerDetails = brokerState.formData.brokerDetails;

    if (brokerDetails.licenseNumber.isNotEmpty) {
      _licenseNumberController.text = brokerDetails.licenseNumber;
      _agencyNameController.text = brokerDetails.agencyName;
    }
  }

  @override
  void dispose() {
    _licenseNumberController.dispose();
    _agencyNameController.dispose();
    super.dispose();
  }

  void _updateFormData() {
    setState(() {
      _errors.clear();
    });

    _validateFields();

    ref.read(brokerApplicationNotifierProvider.notifier).updateBrokerDetails(
          licenseNumber: _licenseNumberController.text.trim(),
          agencyName: _agencyNameController.text.trim(),
        );
  }

  void _validateFields() {
    final licenseNumber = _licenseNumberController.text.trim();
    final agencyName = _agencyNameController.text.trim();

    if (licenseNumber.isEmpty) {
      _errors['licenseNumber'] = 'License number is required';
    }

    if (agencyName.isEmpty) {
      _errors['agencyName'] = 'Agency name is required';
    }
  }

  @override
  Widget build(BuildContext context) {
    final brokerState = ref.watch(brokerApplicationNotifierProvider);
    final brokerDetails = brokerState.formData.brokerDetails;

    if (_licenseNumberController.text != brokerDetails.licenseNumber) {
      _licenseNumberController.text = brokerDetails.licenseNumber;
    }
    if (_agencyNameController.text != brokerDetails.agencyName) {
      _agencyNameController.text = brokerDetails.agencyName;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H3Bold(
          text: 'Broker Details',
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.sm),
        B3Regular(
          text: 'Enter your broker license and agency information',
          color: AppColors.brandNeutral600,
        ),
        const SizedBox(height: AppSpacing.xl),

        // License Number
        WorkerFormField(
          controller: _licenseNumberController,
          label: 'License Number',
          hint: 'Enter your broker license number',
          isRequired: true,
          errorText: _errors['licenseNumber'],
          onChanged: (_) => _updateFormData(),
        ),

        const SizedBox(height: AppSpacing.lg),

        // Agency Name
        WorkerFormField(
          controller: _agencyNameController,
          label: 'Agency Name',
          hint: 'Enter your broker agency name',
          isRequired: true,
          errorText: _errors['agencyName'],
          onChanged: (_) => _updateFormData(),
        ),

        const SizedBox(height: AppSpacing.md),

        // Help text
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppSpacing.md),
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
                    size: 20,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  B3Bold(
                    text: 'Important Information',
                    color: AppColors.brandPrimary700,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              B4Regular(
                text: '• Ensure your broker license is valid and active\n'
                    '• Agency name must match official registration\n'
                    '• All details will be verified before approval',
                color: AppColors.brandPrimary600,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
