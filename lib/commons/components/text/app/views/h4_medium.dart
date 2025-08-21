part of 'custom_text_library.dart';

/// A widget that displays medium H4 text style.
///
/// This widget uses the `TextStyles.h4Medium()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// H4Medium(
///   text: 'Small Heading',
///   locale: Locale('es', 'ES'), // Optional: Set locale to Spanish
/// )
/// ```

class H4Medium extends BaseTextWidget {
  H4Medium({
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
          style: TextStyles.h4Medium().copyWith(color: color),
        );
}
