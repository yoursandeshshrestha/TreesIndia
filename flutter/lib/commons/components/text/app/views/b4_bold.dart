part of 'custom_text_library.dart';

/// A widget that displays bold B4 text style.
///
/// This widget uses the `TextStyles.b4Bold()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// B4Bold(
///   text: 'Bold quaternary body text.',
/// )
/// ```

class B4Bold extends BaseTextWidget {
  B4Bold({
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
          style: TextStyles.b4Bold().copyWith(color: color),
        );
}
