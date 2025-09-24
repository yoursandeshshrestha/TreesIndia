import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/commons/components/connectivity/connectivity_provider.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/components/textfield/app/views/numeric_textfiled_wo_space_widget.dart';
import 'package:trees_india/commons/components/textfield/utilities/mobile_validator.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/presenters/providers/login_provider.dart';
import 'package:trees_india/commons/presenters/providers/notification_service_provider.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final TextEditingController _phoneController = TextEditingController();
  bool _isPhoneValid = false;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  void _onPhoneChanged(String phone) {
    setState(() {
      _isPhoneValid = MobileValidator.isValid(phone);
    });

    // Clear error message when user starts typing
    if (phone.isNotEmpty) {
      ref.read(loginProvider.notifier).clearMessages();
    }
  }

  void _login() async {
    if (_isPhoneValid) {
      final phoneNumber = '+91${_phoneController.text}';
      await ref.read(loginProvider.notifier).login(phoneNumber);
      _navigateToOtpVerification(phoneNumber);
    }
  }

  void _navigateToOtpVerification(String phoneNumber) {
    // Remove the + sign before encoding to avoid URL encoding issues
    final cleanPhoneNumber = phoneNumber.replaceAll('+', '');
    context.push('/otp-verification/$cleanPhoneNumber');
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(loginProvider);
    final isConnected = ref.watch(connectivityNotifierProvider);
    if (!isConnected) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(notificationServiceProvider).showOfflineMessage(
              context,
              onRetry: () => debugPrint('Retrying…'),
            );
      });
    }

    return Scaffold(
      backgroundColor: AppColors.brandNeutral50,
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(
            AppSpacing.lg,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: AppSpacing.xl),

              // Title
              H1Bold(
                text: 'Enter your phone number',
                color: AppColors.brandNeutral900,
              ),
              const SizedBox(height: AppSpacing.xs),

              // Subtitle
              B3Regular(
                text: 'we will send you a text  with a verification code.',
                color: AppColors.brandNeutral600,
              ),

              const SizedBox(height: AppSpacing.lg),

              // Phone Number Input
              B3Medium(
                text: 'Phone Number',
                color: AppColors.brandNeutral900,
              ),
              const SizedBox(height: AppSpacing.sm),

              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.sm + 2,
                    ),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.brandNeutral200),
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    child: B3Medium(
                      text: '+91',
                      color: AppColors.brandNeutral900,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: NumericTextfiledWoSpaceWidget(
                      hintText: 'Enter your phone number',
                      enabled: !authState.isLoading,
                      onTextChanged: (value) {
                        _phoneController.text = value;
                        _onPhoneChanged(value);
                      },
                    ),
                  ),
                ],
              ),

              if (authState.errorMessage != null &&
                  authState.errorMessage!.isNotEmpty) ...[
                const SizedBox(height: AppSpacing.sm),
                B3Regular(
                  text: authState.errorMessage!,
                  color: AppColors.error,
                ),
              ],

              // const SizedBox(height: AppSpacing.md * 2),
              const Spacer(),

              // Terms and Conditions
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: B4Regular(
                  text:
                      'By continuing, you agree to our Terms of Service and Privacy Policy',
                  color: AppColors.brandNeutral500,
                  textAlign: TextAlign.center,
                ),
              ),

              const SizedBox(height: AppSpacing.sm),
              // Login Button
              SizedBox(
                width: double.infinity,
                child: SolidButtonWidget(
                  label: 'Send OTP',
                  isLoading: authState.isLoading,
                  onPressed: _isPhoneValid &&
                          !authState.isLoading &&
                          (authState.errorMessage == null ||
                              authState.errorMessage!.isEmpty)
                      ? _login
                      : null,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
