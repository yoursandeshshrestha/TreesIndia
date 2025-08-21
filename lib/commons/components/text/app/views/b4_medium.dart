part of 'custom_text_library.dart';

/// A widget that displays medium B4 text style.
///
/// This widget uses the `TextStyles.b4Medium()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// B4Medium(
///   text: 'Medium emphasis quaternary text.',
///   color: Colors.teal, // Optional: Customize the text color
/// )
/// ```

class B4Medium extends BaseTextWidget {
  B4Medium({
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
          style: TextStyles.b4Medium().copyWith(color: color),
        );
}
