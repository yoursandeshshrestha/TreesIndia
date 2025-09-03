part of 'custom_text_library.dart';

/// A widget that displays bold H4 text style.
///
/// This widget uses the `TextStyles.h4Bold()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// H4Bold(
///   text: 'Important Subheading',
///   color: Colors.purple, // Optional: Customize the text color
/// )
/// ```

class H4Bold extends BaseTextWidget {
  H4Bold({
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
          style: TextStyles.h4Bold().copyWith(color: color),
        );
}
