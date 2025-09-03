import '../../../../commons/data/models/pagination_model.dart';
import '../../domain/entities/service_response_entity.dart';
import 'service_model.dart';

class ServiceResponseModel extends ServiceResponseEntity {
  const ServiceResponseModel({
    required super.services,
    required super.pagination,
  });

  factory ServiceResponseModel.fromJson(Map<String, dynamic> json) {
    final dataJson = json['data'] as Map<String, dynamic>? ?? {};

    return ServiceResponseModel(
      services: (dataJson['services'] as List<dynamic>?)
              ?.map((service) =>
                  ServiceModel.fromJson(service as Map<String, dynamic>))
              .toList() ??
          [],
      pagination: PaginationModel.fromJson(
          dataJson['pagination'] as Map<String, dynamic>? ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'data': {
        'services': services
            .map((service) => (service as ServiceModel).toJson())
            .toList(),
        'pagination': (pagination as PaginationModel).toJson(),
      },
    };
  }

  ServiceResponseEntity toEntity() {
    return ServiceResponseEntity(
      services: services.map((service) => service).toList(),
      pagination: pagination,
    );
  }

  factory ServiceResponseModel.fromEntity(ServiceResponseEntity entity) {
    return ServiceResponseModel(
      services: entity.services,
      pagination: entity.pagination,
    );
  }
}

class ServicesApiResponseModel {
  final bool success;
  final String message;
  final ServiceResponseModel data;
  final DateTime timestamp;

  const ServicesApiResponseModel({
    required this.success,
    required this.message,
    required this.data,
    required this.timestamp,
  });

  factory ServicesApiResponseModel.fromJson(Map<String, dynamic> json) {
    return ServicesApiResponseModel(
      success: json['success'] as bool,
      message: json['message'] as String,
      data: ServiceResponseModel.fromJson({'data': json['data']}),
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }
}
