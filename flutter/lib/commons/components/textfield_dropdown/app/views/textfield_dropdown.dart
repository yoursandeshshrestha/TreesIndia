import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/theming/text_styles.dart';
import 'package:trees_india/commons/utils/open_custom_bottom_sheet.dart';

class TextfieldDropdown<T> extends StatelessWidget {
  final String label;
  final String hintText;
  final T selectedItem;
  final List<T> items;
  final bool isDisabled;
  final ValueChanged<T> onItemSelected;
  final String Function(T) getDisplayText;
  final Widget Function(T)? itemBuilder;
  final String? bottomSheetHeader;
  final VoidCallback? onCustomTap;

  const TextfieldDropdown({
    super.key,
    required this.label,
    required this.hintText,
    required this.selectedItem,
    required this.items,
    required this.onItemSelected,
    required this.getDisplayText,
    this.itemBuilder,
    this.isDisabled = false,
    this.bottomSheetHeader,
    this.onCustomTap,
  });

  void _openPicker(BuildContext context) {
    openCustomBottomSheet(
      context: context,
      child: items.isNotEmpty
          ? Container(
              constraints: BoxConstraints(
                maxHeight:
                    MediaQuery.of(context).size.height * 0.8, // Max height 80%
              ),
              padding: const EdgeInsetsDirectional.only(
                start: 16.0,
                end: 16.0,
                top: 12.0,
              ),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final contentHeight =
                      items.length * 48.0 + // Approx height per item
                          (bottomSheetHeader != null
                              ? 40.0
                              : 0); // Add header height if present

                  return ConstrainedBox(
                    constraints: BoxConstraints(
                      maxHeight: constraints.maxHeight,
                      minHeight: contentHeight <
                              constraints
                                  .maxHeight // Use content height if smaller
                          ? contentHeight
                          : 0,
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min, // Adjust to content size
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (bottomSheetHeader != null)
                          H2Medium(text: bottomSheetHeader!),
                        if (bottomSheetHeader != null)
                          const SizedBox(height: 12.0),
                        Flexible(
                          child: SingleChildScrollView(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: items.map((item) {
                                return Column(
                                  children: [
                                    GestureDetector(
                                      onTap: () async {
                                        // Close the dropdown first
                                        Navigator.pop(context);
                                        // Then call the selection handler
                                        await Future.delayed(
                                            const Duration(milliseconds: 50));
                                        if (context.mounted) {
                                          onItemSelected(item);
                                        }
                                      },
                                      child: Container(
                                        color: Colors.transparent,
                                        width: double.infinity,
                                        child: Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Expanded(
                                              child: Padding(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                  vertical: 12.0,
                                                ),
                                                child: itemBuilder
                                                        ?.call(item) ??
                                                    H4Medium(
                                                      text:
                                                          getDisplayText(item),
                                                      color: item ==
                                                              selectedItem
                                                          ? AppColors
                                                              .brandPrimary600
                                                          : AppColors
                                                              .brandNeutral600,
                                                      softWrap: true,
                                                    ),
                                              ),
                                            ),
                                            const SizedBox(width: 12),
                                            if (item == selectedItem)
                                              const Icon(
                                                Icons.check,
                                                size: 20.0,
                                                color:
                                                    AppColors.brandPrimary600,
                                              )
                                          ],
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 12.0),
                                  ],
                                );
                              }).toList(),
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            )
          : SizedBox(
              height: MediaQuery.of(context).size.height * 0.1,
              child: Center(
                  child: H4Bold(
                      text: 'No items available',
                      color: AppColors.brandNeutral500)),
            ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isFilled = getDisplayText(selectedItem).trim().isNotEmpty;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        B3Medium(text: label),
        const SizedBox(height: 8),
        TextFormField(
          controller: TextEditingController(text: getDisplayText(selectedItem)),
          readOnly: true,
          enabled: !isDisabled,
          onTap: () {
            if (onCustomTap == null) {
              _openPicker(context);
            } else {
              onCustomTap!();
            }
          },
          style: TextStyles.b3Medium(),
          decoration: InputDecoration(
            isCollapsed: true,
            contentPadding: const EdgeInsetsDirectional.symmetric(
              vertical: 12.0,
              horizontal: 16.0,
            ),
            hintText: hintText,
            hintStyle: TextStyles.b3Medium(
              color: AppColors.brandNeutral400,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.0),
              borderSide: BorderSide(
                color: isFilled
                    ? AppColors.brandNeutral400
                    : AppColors.brandNeutral200,
                width: 1.0,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.0),
              borderSide: BorderSide(
                color: isFilled
                    ? AppColors.brandNeutral400
                    : AppColors.brandNeutral200,
                width: 1.0,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.0),
              borderSide: const BorderSide(
                color: AppColors.brandPrimary600,
                width: 1.0,
              ),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.0),
              borderSide: const BorderSide(
                color: AppColors.stateRed400,
                width: 1.0,
              ),
            ),
            suffixIcon: const Padding(
              padding: EdgeInsetsDirectional.only(end: 16.0),
              child: Icon(
                Icons.keyboard_arrow_down,
                size: 18.0,
                color: AppColors.brandPrimary600,
              ),
            ),
            suffixIconConstraints: const BoxConstraints(
              maxHeight: 18.0,
              maxWidth: 34.0,
            ),
          ),
        ),
      ],
    );
  }
}
