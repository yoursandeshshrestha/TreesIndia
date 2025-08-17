import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/app/viewmodels/auth_state.dart'
    as auth_flow;
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/commons/components/button/app/views/text_button_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/components/textfield/app/views/numeric_textfiled_wo_space_widget.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

import 'package:trees_india/commons/presenters/providers/auth_flow_provider.dart';
import 'package:trees_india/commons/components/textfield/utilities/mobile_validator.dart';

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
      ref.read(authFlowProvider.notifier).clearMessages();
    }
  }

  void _login() {
    if (_isPhoneValid) {
      final phoneNumber = '+91${_phoneController.text}';
      ref.read(authFlowProvider.notifier).login(phoneNumber);
    }
  }

  void _navigateToRegister() {
    context.replace('/signup');
  }

  void _navigateToOtpVerification(String phoneNumber) {
    // Remove the + sign before encoding to avoid URL encoding issues
    final cleanPhoneNumber = phoneNumber.replaceAll('+', '');
    context.push('/otp-verification/$cleanPhoneNumber');
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authFlowProvider);

    // Listen to auth state changes
    ref.listen<auth_flow.AuthFlowStateModel>(authFlowProvider,
        (previous, current) {
      if (current.state == auth_flow.AuthFlowState.loginSuccess) {
        if (current.phoneNumber != null) {
          _navigateToOtpVerification(current.phoneNumber!);
        }
      }
    });

    return Scaffold(
      backgroundColor: AppColors.brandNeutral50,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: AppSpacing.xl),

              // Title
              H1Bold(
                text: 'Welcome Back',
                color: AppColors.brandNeutral900,
              ),
              const SizedBox(height: AppSpacing.sm),

              // Subtitle
              B2Regular(
                text: 'Enter your phone number to continue',
                color: AppColors.brandNeutral600,
              ),

              const SizedBox(height: AppSpacing.xl * 2),

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
                      leadingIcon: Icons.phone,
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

              const SizedBox(height: AppSpacing.md),

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

              const SizedBox(height: AppSpacing.sm),

              // Register Link
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  B3Regular(
                    text: "Don't have an account? ",
                    color: AppColors.brandNeutral600,
                  ),
                  TextButtonWidget(
                    label: 'Sign Up',
                    labelColor: AppColors.brandPrimary600,
                    onPressed: authState.isLoading ? null : _navigateToRegister,
                  ),
                ],
              ),

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

              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }
}
