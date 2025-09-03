part of 'custom_text_library.dart';

/// A widget that displays bold H1 text style.
///
/// This widget uses the `TextStyles.h1Bold()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// H1Bold(
///   text: 'Important Notice',
///   color: Colors.red, // Optional: Customize the text color
///   maxLines: 2, // Optional: Limit the text to 2 lines
/// )
/// ```

class H1Bold extends BaseTextWidget {
  H1Bold({
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
          style: TextStyles.h1Bold().copyWith(color: color),
        );
}
