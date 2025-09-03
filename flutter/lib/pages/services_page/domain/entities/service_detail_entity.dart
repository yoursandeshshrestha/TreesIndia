import 'package:equatable/equatable.dart';
import 'service_area_entity.dart';

class ServiceDetailEntity extends Equatable {
  final int id;
  final String name;
  final String slug;
  final String description;
  final List<String>? images;
  final String priceType;
  final int? price;
  final String? duration;
  final int categoryId;
  final int subcategoryId;
  final String categoryName;
  final String subcategoryName;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;
  final List<ServiceAreaEntity> serviceAreas;

  const ServiceDetailEntity({
    required this.id,
    required this.name,
    required this.slug,
    required this.description,
    this.images,
    required this.priceType,
    this.price,
    this.duration,
    required this.categoryId,
    required this.subcategoryId,
    required this.categoryName,
    required this.subcategoryName,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    required this.serviceAreas,
  });

  @override
  List<Object?> get props => [
        id,
        name,
        slug,
        description,
        images,
        priceType,
        price,
        duration,
        categoryId,
        subcategoryId,
        categoryName,
        subcategoryName,
        isActive,
        createdAt,
        updatedAt,
        deletedAt,
        serviceAreas,
      ];
}
