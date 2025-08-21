part of 'custom_text_library.dart';

/// A widget that displays medium B3 text style.
///
/// This widget uses the `TextStyles.b3Medium()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// B3Medium(
///   text: 'Medium emphasis tertiary text.',
///   color: Colors.lightGrey, // Optional: Customize the text color
/// )
/// ```

class B3Medium extends BaseTextWidget {
  B3Medium( {
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
          style: TextStyles.b3Medium().copyWith(color: color),
        );
}
