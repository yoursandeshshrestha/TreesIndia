part of 'custom_text_library.dart';

/// A widget that displays medium H1 text style.
///
/// This widget uses the `TextStyles.h1Medium()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// H1Medium(
///   text: 'Hello World!',
///   textAlign: TextAlign.center, // Optional: Customize text alignment
/// )
/// ```

class H1Medium extends BaseTextWidget {
  H1Medium({
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
          style: TextStyles.h1Medium().copyWith(color: color),
        );
}
