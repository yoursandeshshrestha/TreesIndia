import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/app/user_profile_provider.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/app/views/widgets/worker_form_field.dart';
import '../../providers/broker_application_providers.dart';
import '../../states/broker_application_state.dart';

class PersonalInfoStep extends ConsumerStatefulWidget {
  const PersonalInfoStep({super.key});

  @override
  ConsumerState<PersonalInfoStep> createState() => _PersonalInfoStepState();
}

class _PersonalInfoStepState extends ConsumerState<PersonalInfoStep> {
  late final TextEditingController _fullNameController;
  late final TextEditingController _emailController;
  late final TextEditingController _phoneController;
  late final TextEditingController _alternativePhoneController;

  final Map<String, String?> _errors = {};

  @override
  void initState() {
    super.initState();
    _fullNameController = TextEditingController();
    _emailController = TextEditingController();
    _phoneController = TextEditingController();
    _alternativePhoneController = TextEditingController();

    // Initialize with user profile data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeFormData();
    });
  }

  void _initializeFormData() {
    final userProfile = ref.read(userProfileProvider);
    final brokerState = ref.read(brokerApplicationNotifierProvider);

    // Prefill from user profile
    if (userProfile.user?.name?.isNotEmpty == true) {
      _fullNameController.text = userProfile.user!.name!;
    }
    if (userProfile.user?.phone?.isNotEmpty == true) {
      _phoneController.text = userProfile.user!.phone!;
    }

    // If form already has data (returning to step), use that
    if (brokerState.formData.contactInfo.fullName.isNotEmpty) {
      _fullNameController.text = brokerState.formData.contactInfo.fullName;
      _emailController.text = brokerState.formData.contactInfo.email;
      _phoneController.text = brokerState.formData.contactInfo.phone;
      _alternativePhoneController.text =
          brokerState.formData.contactInfo.alternativePhone;
    }
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _alternativePhoneController.dispose();
    super.dispose();
  }

  void _updateFormData() {
    // Clear previous errors
    setState(() {
      _errors.clear();
    });

    // Validate fields
    _validateFields();

    // Always update the notifier state with current values
    ref.read(brokerApplicationNotifierProvider.notifier).updatePersonalInfo(
          fullName: _fullNameController.text,
          email: _emailController.text.trim(),
          phone: _phoneController.text.trim(),
          alternativePhone: _alternativePhoneController.text.trim(),
        );
  }

  void _validateFields() {
    final fullName = _fullNameController.text.trim();
    final email = _emailController.text.trim();
    final phone = _phoneController.text.trim();
    final alternativePhone = _alternativePhoneController.text.trim();

    if (fullName.isEmpty) {
      _errors['fullName'] = 'Full name is required';
    }

    if (email.isEmpty) {
      _errors['email'] = 'Email is required';
    } else {
      final emailValidation = BrokerApplicationValidation.validateEmail(email);
      if (emailValidation != null) {
        _errors['email'] = emailValidation;
      }
    }

    if (phone.isEmpty) {
      _errors['phone'] = 'Phone number is required';
    }

    if (alternativePhone.isEmpty) {
      _errors['alternativePhone'] = 'Alternative phone number is required';
    } else {
      final phoneValidation =
          BrokerApplicationValidation.validatePhone(alternativePhone);
      if (phoneValidation != null) {
        _errors['alternativePhone'] = phoneValidation;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final brokerState = ref.watch(brokerApplicationNotifierProvider);
    final contactInfo = brokerState.formData.contactInfo;

    // Update controllers if they differ from state
    if (_fullNameController.text != contactInfo.fullName) {
      _fullNameController.text = contactInfo.fullName;
    }
    if (_emailController.text != contactInfo.email) {
      _emailController.text = contactInfo.email;
    }
    if (_phoneController.text != contactInfo.phone) {
      _phoneController.text = contactInfo.phone;
    }
    if (_alternativePhoneController.text != contactInfo.alternativePhone) {
      _alternativePhoneController.text = contactInfo.alternativePhone;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H3Bold(
          text: 'Personal Information',
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.sm),
        B3Regular(
          text: 'Enter your contact information',
          color: AppColors.brandNeutral600,
        ),
        const SizedBox(height: AppSpacing.xl),

        // Full Name
        WorkerFormField(
          controller: _fullNameController,
          label: 'Full Name',
          hint: 'Enter your full name',
          isRequired: true,
          errorText: _errors['fullName'],
          onChanged: (_) => _updateFormData(),
        ),

        const SizedBox(height: AppSpacing.lg),

        // Email Address
        WorkerFormField(
          controller: _emailController,
          label: 'Email Address',
          hint: 'Enter your email address',
          isRequired: true,
          keyboardType: TextInputType.emailAddress,
          errorText: _errors['email'] ?? brokerState.emailError,
          onChanged: (_) => _updateFormData(),
        ),

        const SizedBox(height: AppSpacing.lg),

        // Phone Number (readonly)
        WorkerFormField(
          controller: _phoneController,
          label: 'Phone Number',
          hint: 'Your registered phone number',
          isRequired: true,
          enabled: false,
          keyboardType: TextInputType.phone,
        ),

        const SizedBox(height: AppSpacing.lg),

        // Alternative Phone Number
        WorkerFormField(
          controller: _alternativePhoneController,
          label: 'Alternative Phone Number',
          hint: 'Enter alternative phone number',
          isRequired: true,
          keyboardType: TextInputType.phone,
          errorText: _errors['alternativePhone'],
          onChanged: (_) => _updateFormData(),
        ),

        const SizedBox(height: AppSpacing.sm),
        B4Regular(
          text: 'This will be used as a backup contact method',
          color: AppColors.brandNeutral500,
        ),
      ],
    );
  }
}
