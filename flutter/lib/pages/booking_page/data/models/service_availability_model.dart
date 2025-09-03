import '../../domain/entities/service_availability_entity.dart';

class ServiceAvailabilityModel extends ServiceAvailabilityEntity {
  const ServiceAvailabilityModel({
    required super.isAvailable,
  });

  factory ServiceAvailabilityModel.fromJson(Map<String, dynamic> json) {
    return ServiceAvailabilityModel(
      isAvailable: json['data'] as bool? ?? false,
    );
  }

  ServiceAvailabilityEntity toEntity() {
    return ServiceAvailabilityEntity(
      isAvailable: isAvailable,
    );
  }
}