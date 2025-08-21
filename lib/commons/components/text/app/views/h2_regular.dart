part of 'custom_text_library.dart';

/// A widget that displays regular H2 text style.
///
/// This widget uses the `TextStyles.h2Regular()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// H2Regular(
///   text: 'Section Title',
///   locale: Locale('fr', 'FR'), // Optional: Set locale to French
/// )
/// ```

class H2Regular extends BaseTextWidget {
  H2Regular({
    super.key,
    required super.text,
    super.textAlign,
    super.textDirection,
    super.locale,
    super.softWrap,
    super.overflow,
    super.maxLines,
    super.semanticsLabel,
    super.textWidthBasis,
    super.textHeightBehavior,
    super.textScaler,
    Color? color, // Adding color parameter
  }) : super(
          style: TextStyles.h2Regular().copyWith(color: color),
        );
}
