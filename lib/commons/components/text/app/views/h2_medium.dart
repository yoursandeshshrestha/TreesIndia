part of 'custom_text_library.dart';

/// A widget that displays medium H2 text style.
///
/// This widget uses the `TextStyles.h2Medium()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// H2Medium(
///   text: 'Subheading',
///   overflow: TextOverflow.ellipsis, // Optional: Handle overflow with ellipsis
/// )
/// ```

class H2Medium extends BaseTextWidget {
  H2Medium({
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
          style: TextStyles.h2Medium().copyWith(color: color),
        );
}
