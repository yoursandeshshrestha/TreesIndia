part of 'custom_text_library.dart';

/// A widget that displays bold B2 text style.
///
/// This widget uses the `TextStyles.b2Bold()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// B2Bold(
///   text: 'Bold secondary body text.',
/// )
/// ```

class B2Bold extends BaseTextWidget {
  B2Bold({
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
          style: TextStyles.b2Bold().copyWith(color: color),
        );
}
