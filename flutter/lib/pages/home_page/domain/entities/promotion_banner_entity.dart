import 'package:equatable/equatable.dart';

class PromotionBannerEntity extends Equatable {
  final int id;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String title;
  final String image;
  final String link;
  final bool isActive;

  const PromotionBannerEntity({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.title,
    required this.image,
    required this.link,
    required this.isActive,
  });

  @override
  List<Object?> get props => [
        id,
        createdAt,
        updatedAt,
        title,
        image,
        link,
        isActive,
      ];
}
