import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'property_form_widget.dart';

class AddPropertyBottomSheet extends ConsumerWidget {
  const AddPropertyBottomSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final screenHeight = MediaQuery.of(context).size.height;
    final bottomSheetHeight = screenHeight * 0.9; // 90% of screen height

    return Container(
      height: bottomSheetHeight,
      padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.lg),
      decoration: const BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
      ),
      child: Column(
        children: [
          // Handle bar
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 12.0),
              child: Container(
                width: 80.0,
                height: 6.0,
                decoration: BoxDecoration(
                  color: const Color(0xFFc5c5c5),
                  borderRadius: BorderRadius.circular(80.0),
                ),
              ),
            ),
          ),

          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              H3Medium(
                text: 'Add New Address',
                color: AppColors.brandNeutral900,
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close),
                color: AppColors.brandNeutral600,
              ),
            ],
          ),

          // Property Form Content
          const Expanded(
            child: PropertyFormWidget(),
          ),
        ],
      ),
    );
  }
}
