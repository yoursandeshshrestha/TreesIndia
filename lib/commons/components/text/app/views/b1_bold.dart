part of 'custom_text_library.dart';


/// A widget that displays bold B1 text style.
///
/// This widget uses the `TextStyles.b1Bold()` style with an optional color parameter
/// to customize the text color.
///
/// Usage Example:
/// ```dart
/// B1Bold(
///   text: 'Bold body text.',
///   color: Colors.black, // Optional: Customize the text color
/// )
/// ```

class B1Bold extends BaseTextWidget {
  B1Bold({
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
          style: TextStyles.b1Bold().copyWith(color: color),
        );
}
