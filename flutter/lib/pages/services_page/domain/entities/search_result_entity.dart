import 'package:equatable/equatable.dart';

class SearchResultEntity extends Equatable {
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

  const SearchResultEntity({
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