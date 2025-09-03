part of 'custom_text_library.dart';

/// A widget that displays regular B1 text style.
///
/// This widget uses the `TextStyles.b1Regular()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// B1Regular(
///   text: 'Body text here.',
/// )
/// ```

class B1Regular extends BaseTextWidget {
  B1Regular({
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
          style: TextStyles.b1Regular().copyWith(color: color),
        );
}
