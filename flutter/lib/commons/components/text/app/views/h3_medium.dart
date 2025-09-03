part of 'custom_text_library.dart';

/// A widget that displays medium H3 text style.
///
/// This widget uses the `TextStyles.h3Medium()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// H3Medium(
///   text: 'Subheader',
///   maxLines: 3, // Optional: Limit the text to 3 lines
/// )
/// ```

class H3Medium extends BaseTextWidget {
  H3Medium({
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
          style: TextStyles.h3Medium().copyWith(color: color),
        );
}
