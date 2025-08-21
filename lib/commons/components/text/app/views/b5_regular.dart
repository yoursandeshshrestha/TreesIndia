part of 'custom_text_library.dart';

class B5Regular extends BaseTextWidget {
  B5Regular({
    super.key,
    required super.text,
    super.textAlign,
    super.textDirection,
    super.locale,
    super.softWrap,
    super.overflow,
    super.maxLines,
    super.semanticsLabel,
    super.textHeightBehavior,
    super.textScaler,
    Color? color,
  }) : super(
          style: TextStyles.b5Regular().copyWith(color: color),
        );
}
