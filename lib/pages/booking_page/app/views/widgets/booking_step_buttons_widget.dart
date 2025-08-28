import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/button/app/views/outline_button_widget.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class BookingStepButtonsWidget extends ConsumerWidget {
  final int currentStep;
  final VoidCallback? onBack;
  final VoidCallback? onContinue;
  final bool canContinue;
  final String continueLabel;
  final bool isLoading;

  const BookingStepButtonsWidget({
    super.key,
    required this.currentStep,
    this.onBack,
    this.onContinue,
    required this.canContinue,
    required this.continueLabel,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(
            color: Colors.grey.shade200,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          if (currentStep > 0) ...[
            Expanded(
              child: OutlinedButtonWidget(
                label: 'Back',
                onPressed: onBack,
                borderColor: const Color(0xFF374151),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
          ],
          Expanded(
            child: SolidButtonWidget(
              label: continueLabel,
              onPressed: canContinue ? onContinue : null,
              isLoading: isLoading,
            ),
          ),
        ],
      ),
    );
  }
}