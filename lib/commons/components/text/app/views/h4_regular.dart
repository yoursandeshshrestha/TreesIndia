part of 'custom_text_library.dart';

/// A widget that displays regular H4 text style.
///
/// This widget uses the `TextStyles.h4Regular()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// H4Regular(
///   text: 'Subcontent Title',
///   textAlign: TextAlign.left, // Optional: Left align the text
/// )
/// ```

class H4Regular extends BaseTextWidget {
  H4Regular({
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
          style: TextStyles.h4Regular().copyWith(color: color),
        );
}
