part of 'custom_text_library.dart';

/// A widget that displays bold H2 text style.
///
/// This widget uses the `TextStyles.h2Bold()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// H2Bold(
///   text: 'Subsection Title',
///   color: Colors.green, // Optional: Customize the text color
/// )
/// ```

class H2Bold extends BaseTextWidget {
  H2Bold({
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
          style: TextStyles.h2Bold().copyWith(color: color),
        );
}
