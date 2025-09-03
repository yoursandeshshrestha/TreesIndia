part of 'custom_text_library.dart';

/// A widget that displays bold H3 text style.
///
/// This widget uses the `TextStyles.h3Bold()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// H3Bold(
///   text: 'Highlighted Header',
///   color: Colors.orange, // Optional: Customize the text color
/// )
/// ```

class H3Bold extends BaseTextWidget {
  H3Bold({
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
          style: TextStyles.h3Bold().copyWith(color: color),
        );
}
