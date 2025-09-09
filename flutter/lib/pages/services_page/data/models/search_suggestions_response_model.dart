import 'search_suggestion_model.dart';
import 'service_search_model.dart';
import '../../domain/entities/search_suggestions_response_entity.dart';
import '../../domain/entities/service_detail_entity.dart';

class SearchSuggestionsDataModel {
  final List<SearchSuggestionModel> keywords;
  final List<ServiceSearchModel> services;

  const SearchSuggestionsDataModel({
    required this.keywords,
    required this.services,
  });

  factory SearchSuggestionsDataModel.fromJson(Map<String, dynamic> json) {
    return SearchSuggestionsDataModel(
      keywords: (json['keywords'] as List<dynamic>?)
              ?.map((keyword) => SearchSuggestionModel.fromJson(
                  keyword as Map<String, dynamic>))
              .toList() ??
          [],
      services: (json['services'] as List<dynamic>?)
              ?.map((service) =>
                  ServiceSearchModel.fromJson(service as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'keywords': keywords.map((keyword) => keyword.toJson()).toList(),
      'services': services.map((service) => service.toJson()).toList(),
    };
  }
}

class SearchSuggestionsResponseModel {
  final bool success;
  final String message;
  final SearchSuggestionsDataModel data;
  final DateTime timestamp;

  const SearchSuggestionsResponseModel({
    required this.success,
    required this.message,
    required this.data,
    required this.timestamp,
  });

  factory SearchSuggestionsResponseModel.fromJson(Map<String, dynamic> json) {
    return SearchSuggestionsResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: SearchSuggestionsDataModel.fromJson(
          json['data'] as Map<String, dynamic>? ?? {}),
      timestamp: DateTime.tryParse(json['timestamp'] as String? ?? '') ??
          DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': data.toJson(),
      'timestamp': timestamp.toIso8601String(),
    };
  }

  SearchSuggestionsResponseEntity toEntity() {
    return SearchSuggestionsResponseEntity(
      success: success,
      message: message,
      keywords: data.keywords.map((keyword) => keyword.toEntity()).toList(),
      services: data.services
          .map((service) => _convertServiceToEntity(service))
          .toList(),
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
