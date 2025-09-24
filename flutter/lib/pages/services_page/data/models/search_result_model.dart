import 'package:equatable/equatable.dart';
import '../../domain/entities/search_result_entity.dart';

class SearchResultModel extends Equatable {
  final int id;
  final String name;
  final String slug;
  final String description;
  final String category;
  final String subcategory;
  final String priceType;
  final int? price;
  final String? duration;
  final double? rating;
  final int? totalBookings;
  final List<String>? images;
  final List<String> serviceAreas;
  final int matchScore;
  final String matchReason;
  final String highlightedName;
  final String highlightedDescription;
  final DateTime createdAt;
  final DateTime updatedAt;

  const SearchResultModel({
    required this.id,
    required this.name,
    required this.slug,
    required this.description,
    required this.category,
    required this.subcategory,
    required this.priceType,
    this.price,
    this.duration,
    this.rating,
    this.totalBookings,
    this.images,
    required this.serviceAreas,
    required this.matchScore,
    required this.matchReason,
    required this.highlightedName,
    required this.highlightedDescription,
    required this.createdAt,
    required this.updatedAt,
  });

  factory SearchResultModel.fromJson(Map<String, dynamic> json) {
    return SearchResultModel(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      description: json['description'] as String? ?? '',
      category: json['category'] as String? ?? '',
      subcategory: json['subcategory'] as String? ?? '',
      priceType: json['price_type'] as String? ?? '',
      price: json['price'] as int?,
      duration: json['duration'] as String?,
      rating: (json['rating'] as num?)?.toDouble(),
      totalBookings: json['total_bookings'] as int?,
      images: (json['images'] != null &&
              (json['images'] as List<dynamic>?)?.isNotEmpty == true)
          ? (json['images'] as List<dynamic>).cast<String>()
          : null,
      serviceAreas: (json['service_areas'] as List<dynamic>?)
              ?.cast<String>() ?? [],
      matchScore: json['match_score'] as int? ?? 0,
      matchReason: json['match_reason'] as String? ?? '',
      highlightedName: json['highlighted_name'] as String? ?? '',
      highlightedDescription: json['highlighted_description'] as String? ?? '',
      createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ??
          DateTime.now(),
      updatedAt: DateTime.tryParse(json['updated_at'] as String? ?? '') ??
          DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      'category': category,
      'subcategory': subcategory,
      'price_type': priceType,
      'price': price,
      'duration': duration,
      'rating': rating,
      'total_bookings': totalBookings,
      'images': images,
      'service_areas': serviceAreas,
      'match_score': matchScore,
      'match_reason': matchReason,
      'highlighted_name': highlightedName,
      'highlighted_description': highlightedDescription,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  SearchResultEntity toEntity() {
    return SearchResultEntity(
      id: id,
      name: name,
      slug: slug,
      description: description,
      category: category,
      subcategory: subcategory,
      priceType: priceType,
      price: price,
      duration: duration,
      rating: rating,
      totalBookings: totalBookings,
      images: images,
      serviceAreas: serviceAreas,
      matchScore: matchScore,
      matchReason: matchReason,
      highlightedName: highlightedName,
      highlightedDescription: highlightedDescription,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        name,
        slug,
        description,
        category,
        subcategory,
        priceType,
        price,
        duration,
        rating,
        totalBookings,
        images,
        serviceAreas,
        matchScore,
        matchReason,
        highlightedName,
        highlightedDescription,
        createdAt,
        updatedAt,
      ];
}