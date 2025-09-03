part of 'custom_text_library.dart';

/// A widget that displays regular B3 text style.
///
/// This widget uses the `TextStyles.b3Regular()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// B3Regular(
///   text: 'Tertiary body text.',
/// )
/// ```

class B3Regular extends BaseTextWidget {
  B3Regular({
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
          style: TextStyles.b3Regular().copyWith(color: color),
        );
}
