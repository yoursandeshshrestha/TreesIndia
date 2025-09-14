import 'service_search_model.dart';
import '../../domain/entities/popular_services_response_entity.dart';
import '../../domain/entities/service_detail_entity.dart';

class PopularServicesResponseModel {
  final bool success;
  final String message;
  final List<ServiceSearchModel> data;
  final DateTime timestamp;

  const PopularServicesResponseModel({
    required this.success,
    required this.message,
    required this.data,
    required this.timestamp,
  });

  factory PopularServicesResponseModel.fromJson(Map<String, dynamic> json) {
    return PopularServicesResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: (json['data'] as List<dynamic>?)
              ?.map((service) =>
                  ServiceSearchModel.fromJson(service as Map<String, dynamic>))
              .toList() ??
          [],
      timestamp: DateTime.tryParse(json['timestamp'] as String? ?? '') ??
          DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': data.map((service) => service.toJson()).toList(),
      'timestamp': timestamp.toIso8601String(),
    };
  }

  PopularServicesResponseEntity toEntity() {
    return PopularServicesResponseEntity(
      success: success,
      message: message,
      data: data.map((service) => _convertServiceToEntity(service)).toList(),
      timestamp: timestamp,
    );
  }

  ServiceDetailEntity _convertServiceToEntity(ServiceSearchModel service) {
    return ServiceDetailEntity(
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      images: service.images,
      priceType: service.priceType,
      price: service.price,
      duration: service.duration,
      categoryId: service.categoryId,
      subcategoryId: service.subcategoryId,
      categoryName: service.effectiveCategoryName,
      subcategoryName: service.effectiveSubcategoryName,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      deletedAt: service.deletedAt,
      serviceAreas: service.serviceAreas ?? [],
    );
  }
}
