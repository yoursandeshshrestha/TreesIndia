part of 'custom_text_library.dart';

/// A widget that displays regular H1 text style.
///
/// This widget uses the `TextStyles.h1Regular()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// H1Regular(
///   text: 'Welcome!',
///   color: Colors.blue, // Optional: Customize the text color
/// )
/// ```

class H1Regular extends BaseTextWidget {
  H1Regular({
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
          style: TextStyles.h1Regular().copyWith(color: color),
        );
}
