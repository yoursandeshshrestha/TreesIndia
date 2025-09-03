part of 'custom_text_library.dart';

class B5Medium extends BaseTextWidget {
  B5Medium({
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
          style: TextStyles.b5Medium().copyWith(color: color),
        );
}
