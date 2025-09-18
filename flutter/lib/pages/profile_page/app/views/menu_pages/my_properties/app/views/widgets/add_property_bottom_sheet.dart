import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_properties/app/providers/property_providers.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_properties/app/states/property_form_state.dart';
import 'property_form_widget.dart';

class AddPropertyBottomSheet extends ConsumerWidget {
  const AddPropertyBottomSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final formState = ref.watch(propertyFormNotifierProvider);

    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (didPop, result) {
        ref.read(propertyFormNotifierProvider.notifier).resetForm();
      },
      child: Container(
        height: MediaQuery.of(context).size.height * 0.9,
        margin: const EdgeInsets.only(top: 50),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
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
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: AppColors.brandNeutral200,
                    width: 1,
                  ),
                ),
              ),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: const Icon(
                      Icons.close,
                      size: 24,
                      color: AppColors.brandNeutral700,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        H3Bold(
                          text: 'Add New Property',
                          color: AppColors.brandNeutral900,
                        ),
                        const SizedBox(height: 4),
                        B3Regular(
                          text: formState.currentStep.subtitle,
                          color: AppColors.brandNeutral600,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Property Form Content
            const Expanded(
              child: PropertyFormWidget(),
            ),
          ],
        ),
      ),
    );
  }
}
