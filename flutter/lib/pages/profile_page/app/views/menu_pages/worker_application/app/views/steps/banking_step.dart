import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import '../../providers/worker_application_providers.dart';
import '../../states/worker_application_state.dart';
import '../widgets/worker_form_field.dart';

class BankingStep extends ConsumerStatefulWidget {
  const BankingStep({super.key});

  @override
  ConsumerState<BankingStep> createState() => _BankingStepState();
}

class _BankingStepState extends ConsumerState<BankingStep> {
  late final TextEditingController _accountHolderController;
  late final TextEditingController _accountNumberController;
  late final TextEditingController _ifscController;
  late final TextEditingController _bankNameController;

  final Map<String, String?> _errors = {};

  @override
  void initState() {
    super.initState();
    _accountHolderController = TextEditingController();
    _accountNumberController = TextEditingController();
    _ifscController = TextEditingController();
    _bankNameController = TextEditingController();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeFormData();
    });
  }

  void _initializeFormData() {
    final workerState = ref.read(workerApplicationNotifierProvider);
    final banking = workerState.formData.bankingInfo;

    if (banking.accountHolderName.isNotEmpty) {
      _accountHolderController.text = banking.accountHolderName;
      _accountNumberController.text = banking.accountNumber;
      _ifscController.text = banking.ifscCode;
      _bankNameController.text = banking.bankName;
    }
  }

  @override
  void dispose() {
    _accountHolderController.dispose();
    _accountNumberController.dispose();
    _ifscController.dispose();
    _bankNameController.dispose();
    super.dispose();
  }

  void _updateFormData() {
    setState(() {
      _errors.clear();
    });

    _validateFields();

    // Always update the notifier state with current values (regardless of validation)
    ref.read(workerApplicationNotifierProvider.notifier).updateBankingInfo(
      accountHolderName: _accountHolderController.text, // Keep spaces for names
      accountNumber: _accountNumberController.text.trim(),
      ifscCode: _ifscController.text.trim().toUpperCase(),
      bankName: _bankNameController.text, // Keep spaces for bank names too
    );
  }

  void _validateFields() {
    final accountHolder = _accountHolderController.text.trim();
    final accountNumber = _accountNumberController.text.trim();
    final ifsc = _ifscController.text.trim();
    final bankName = _bankNameController.text.trim();

    if (accountHolder.isEmpty) {
      _errors['accountHolder'] = 'Account holder name is required';
    }

    if (accountNumber.isEmpty) {
      _errors['accountNumber'] = 'Account number is required';
    }

    if (ifsc.isEmpty) {
      _errors['ifsc'] = 'IFSC code is required';
    } else {
      final ifscValidation = WorkerApplicationValidation.validateIFSC(ifsc);
      if (ifscValidation != null) {
        _errors['ifsc'] = ifscValidation;
      }
    }

    if (bankName.isEmpty) {
      _errors['bankName'] = 'Bank name is required';
    }
  }

  @override
  Widget build(BuildContext context) {
    // Sync with current state whenever widget rebuilds
    final workerState = ref.watch(workerApplicationNotifierProvider);
    final banking = workerState.formData.bankingInfo;

    // Update controllers if they differ from state (without triggering onChanged)
    if (_accountHolderController.text != banking.accountHolderName) {
      _accountHolderController.text = banking.accountHolderName;
    }
    if (_accountNumberController.text != banking.accountNumber) {
      _accountNumberController.text = banking.accountNumber;
    }
    if (_ifscController.text != banking.ifscCode) {
      _ifscController.text = banking.ifscCode;
    }
    if (_bankNameController.text != banking.bankName) {
      _bankNameController.text = banking.bankName;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H3Bold(
          text: 'Banking Information',
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.sm),
        B3Regular(
          text: 'Enter your banking details for payments',
          color: AppColors.brandNeutral600,
        ),
        const SizedBox(height: AppSpacing.xl),

        // Account Holder Name
        WorkerFormField(
          controller: _accountHolderController,
          label: 'Account Holder Name',
          hint: 'Enter account holder name',
          isRequired: true,
          errorText: _errors['accountHolder'],
          onChanged: (_) => _updateFormData(),
        ),

        const SizedBox(height: AppSpacing.lg),

        // Account Number
        WorkerFormField(
          controller: _accountNumberController,
          label: 'Account Number',
          hint: 'Enter account number',
          isRequired: true,
          keyboardType: TextInputType.number,
          errorText: _errors['accountNumber'],
          onChanged: (_) => _updateFormData(),
        ),

        const SizedBox(height: AppSpacing.lg),

        // IFSC Code
        WorkerFormField(
          controller: _ifscController,
          label: 'IFSC Code',
          hint: 'Enter IFSC code (e.g., SBIN0123456)',
          isRequired: true,
          errorText: _errors['ifsc'],
          onChanged: (_) => _updateFormData(),
        ),

        const SizedBox(height: AppSpacing.lg),

        // Bank Name
        WorkerFormField(
          controller: _bankNameController,
          label: 'Bank Name',
          hint: 'Enter bank name',
          isRequired: true,
          errorText: _errors['bankName'],
          onChanged: (_) => _updateFormData(),
        ),

        const SizedBox(height: AppSpacing.md),

        // Info container
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
                    Icons.security,
                    color: AppColors.brandPrimary600,
                    size: 20,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  B3Bold(
                    text: 'Secure & Safe',
                    color: AppColors.brandPrimary700,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              B4Regular(
                text: 'Your banking information is encrypted and secure. '
                      'This will be used for salary payments and work-related transactions.',
                color: AppColors.brandPrimary600,
              ),
            ],
          ),
        ),
      ],
    );
  }
}