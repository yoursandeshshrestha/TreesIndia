part of 'custom_text_library.dart';

/// A widget that displays regular B2 text style.
///
/// This widget uses the `TextStyles.b2Regular()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// B2Regular(
///   text: 'Secondary body text.',
///   textAlign: TextAlign.justify, // Optional: Justify the text
/// )
/// ```

class B2Regular extends BaseTextWidget {
  B2Regular({
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
          style: TextStyles.b2Regular().copyWith(color: color),
        );
}
