import '../../domain/entities/promotion_banner_entity.dart';

class PromotionBannerModel {
  final int id;
  final String createdAt;
  final String updatedAt;
  final String title;
  final String image;
  final String link;
  final bool isActive;

  PromotionBannerModel({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.title,
    required this.image,
    required this.link,
    required this.isActive,
  });

  factory PromotionBannerModel.fromJson(Map<String, dynamic> json) {
    return PromotionBannerModel(
      id: json['id'] as int,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
      title: json['title'] as String,
      image: json['image'] as String,
      link: json['link'] as String,
      isActive: json['is_active'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'title': title,
      'image': image,
      'link': link,
      'is_active': isActive,
    };
  }

  PromotionBannerEntity toEntity() {
    return PromotionBannerEntity(
      id: id,
      createdAt: DateTime.parse(createdAt),
      updatedAt: DateTime.parse(updatedAt),
      title: title,
      image: image,
      link: link,
      isActive: isActive,
    );
  }
}
