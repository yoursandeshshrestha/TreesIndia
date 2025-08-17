part of 'custom_text_library.dart';

/// A widget that displays regular B4 text style.
///
/// This widget uses the `TextStyles.b4Regular()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// B4Regular(
///   text: 'Quaternary body text.',
/// )
/// ```

class B4Regular extends BaseTextWidget {
  B4Regular( {
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
          style: TextStyles.b4Regular().copyWith(color: color),
        );
}
