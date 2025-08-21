part of 'custom_text_library.dart';

/// A widget that displays medium B2 text style.
///
/// This widget uses the `TextStyles.b2Medium()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// B2Medium(
///   text: 'Medium emphasis secondary text.',
///   color: Colors.darkGrey, // Optional: Customize the text color
/// )
/// ```

class B2Medium extends BaseTextWidget {
  B2Medium({
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
          style: TextStyles.b2Medium().copyWith(color: color),
        );
}
