import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/components/textfield/app/views/otp_textfield_widget.dart';
import 'package:trees_india/commons/constants/app_colors.dart';

class OtpBottomSheet extends StatefulWidget {
  final String phoneNumber;
  final Function(String) onSubmit;
  final bool isDeleting;

  const OtpBottomSheet({
    super.key,
    required this.phoneNumber,
    required this.onSubmit,
    this.isDeleting = false,
  });

  @override
  State<OtpBottomSheet> createState() => _OtpBottomSheetState();

  static Future<void> show({
    required BuildContext context,
    required String phoneNumber,
    required Function(String) onSubmit,
    bool isDeleting = false,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => OtpBottomSheet(
        phoneNumber: phoneNumber,
        onSubmit: onSubmit,
        isDeleting: isDeleting,
      ),
    );
  }
}

class _OtpBottomSheetState extends State<OtpBottomSheet> {
  String _currentOtp = '';
  String? errorMessage;

  void _handleOtpChanged(String otp) {
    setState(() {
      _currentOtp = otp;
      if (errorMessage != null) {
        errorMessage = null;
      }
    });
  }

  void _handleOtpCompleted(String otp) {
    setState(() {
      _currentOtp = otp;
      if (errorMessage != null) {
        errorMessage = null;
      }
    });
  }

  void _handleSubmit() {
    if (_currentOtp.length != 6) {
      setState(() {
        errorMessage = 'Please enter a valid 6-digit OTP';
      });
      return;
    }

    widget.onSubmit(_currentOtp);
  }

  void _handleCancel() {
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle bar
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 24),
          H2Bold(
            text: 'Verify OTP',
          ),
          const SizedBox(height: 8),
          B3Medium(
            text:
                'Enter the 6-digit OTP sent to ${widget.phoneNumber} to confirm account deletion.',
            color: AppColors.brandNeutral500,
          ),
          const SizedBox(height: 32),
          OtpTextfieldWidget(
            length: 6,
            enabled: !widget.isDeleting,
            onChanged: _handleOtpChanged,
            onCompleted: _handleOtpCompleted,
          ),
          if (errorMessage != null) ...[
            const SizedBox(height: 8),
            Text(
              errorMessage!,
              style: const TextStyle(
                color: Colors.red,
                fontSize: 14,
              ),
            ),
          ],
          const SizedBox(height: 32),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: widget.isDeleting ? null : _handleCancel,
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    side: BorderSide(color: Colors.grey[300]!),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    'Cancel',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: Colors.grey[700],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  onPressed: widget.isDeleting || _currentOtp.length != 6
                      ? null
                      : _handleSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red[600],
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: widget.isDeleting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Delete Account',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
