import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/commons/components/snackbar/app/views/error_snackbar_widget.dart';
import 'package:trees_india/commons/components/snackbar/app/views/success_snackbar_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/components/textfield/app/views/otp_textfield_widget.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/presenters/providers/login_provider.dart';
import 'package:trees_india/commons/presenters/viewmodels/login_viewmodel/login_state.dart';

class OtpVerificationPage extends ConsumerStatefulWidget {
  final String phoneNumber;

  const OtpVerificationPage({
    super.key,
    required this.phoneNumber,
  });

  @override
  ConsumerState<OtpVerificationPage> createState() =>
      _OtpVerificationPageState();
}

class _OtpVerificationPageState extends ConsumerState<OtpVerificationPage> {
  String otpCode = '';
  bool isOtpComplete = false;

  @override
  void initState() {
    super.initState();
    // Set the phone number in the auth flow
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Add back the + sign if it's missing
      final phoneNumber = widget.phoneNumber.startsWith('+')
          ? widget.phoneNumber
          : '+${widget.phoneNumber}';
      ref.read(loginProvider.notifier).setPhoneNumber(phoneNumber);
    });
  }

  void _showSnackBar(String message, bool isError) {
    ScaffoldMessenger.of(context).clearSnackBars();
    final snackBarWidget = isError
        ? ErrorSnackbarWidget(message: message)
        : SuccessSnackbarWidget(message: message);
    ScaffoldMessenger.of(context).showSnackBar(snackBarWidget.createSnackBar());
  }

  void _onOtpCompleted(String otp) {
    setState(() {
      otpCode = otp;
      isOtpComplete = otp.length == 6;
    });
  }

  void _onOtpChanged(String otp) {
    setState(() {
      otpCode = otp;
      isOtpComplete = otp.length == 6;
    });
  }

  void _verifyOtp() {
    if (isOtpComplete) {
      ref.read(loginProvider.notifier).verifyOtp(otpCode);
    }
  }

  // void _resendOtp() {
  //   // Resend OTP logic would go here
  //   // For now, just show a message
  //   _showSnackBar('OTP resent successfully', false);
  // }

  String _formatPhoneNumber(String phone) {
    // Handle both "+918617662584" and "918617662584" formats
    String cleanPhone = phone.replaceAll('+', '');
    if (cleanPhone.length >= 10) {
      // If it starts with 91, format as +91 XXXXX XXXXX
      if (cleanPhone.startsWith('91')) {
        final mainNumber = cleanPhone.substring(2);
        return '+91 ${mainNumber.substring(0, 5)} ${mainNumber.substring(5)}';
      } else {
        // If it's just 10 digits, add +91
        return '+91 ${cleanPhone.substring(0, 5)} ${cleanPhone.substring(5)}';
      }
    }
    return phone; // Return as-is if format is unclear
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(loginProvider);

    // Listen to auth state changes
    ref.listen<LoginStateModel>(loginProvider, (previous, current) {
      if (current.state == LoginState.authenticationSuccess) {
        _showSnackBar(
            current.successMessage ?? 'OTP verified successfully!', false);
        // Navigate to location loading page to handle location setup
        context.go('/location-loading');
      }
    });

    return Scaffold(
      backgroundColor: AppColors.brandNeutral50,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.brandNeutral900),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Phone Lottie Animation
              Lottie.asset(
                'assets/lottie/phone_verification_lottie.json',
                width: 80,
                height: 80,
                fit: BoxFit.contain,
                repeat: false,
              ),
              const SizedBox(height: AppSpacing.xs),
              // Title
              H2Bold(
                text: 'Verify OTP',
                color: AppColors.brandNeutral900,
              ),
              const SizedBox(height: AppSpacing.sm),

              // Subtitle
              B2Regular(
                text: 'We have sent a 4-digit verification code to',
                color: AppColors.brandNeutral600,
              ),
              const SizedBox(height: AppSpacing.xs),

              B2Medium(
                text: _formatPhoneNumber(widget.phoneNumber),
                color: AppColors.brandNeutral900,
              ),

              const SizedBox(height: AppSpacing.xl),

              // OTP Input
              OtpTextfieldWidget(
                length: 6,
                enabled: !authState.isLoading,
                onCompleted: _onOtpCompleted,
                onChanged: _onOtpChanged,
              ),

              const SizedBox(height: AppSpacing.sm),

              // // Resend OTP
              // Row(
              //   mainAxisAlignment: MainAxisAlignment.center,
              //   children: [
              //     B3Regular(
              //       text: "Didn't receive the code? ",
              //       color: AppColors.brandNeutral600,
              //     ),
              //     TextButtonWidget(
              //       label: 'Resend',
              //       labelColor: AppColors.brandPrimary600,
              //       onPressed: authState.isLoading ? null : _resendOtp,
              //     ),
              //   ],
              // ),

              const Spacer(),

              // Verify Button
              SizedBox(
                width: double.infinity,
                child: SolidButtonWidget(
                  label: 'Verify OTP',
                  isLoading: authState.isLoading,
                  onPressed:
                      isOtpComplete && !authState.isLoading ? _verifyOtp : null,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
