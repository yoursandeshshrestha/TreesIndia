import '../../domain/entities/service_area_entity.dart';

class ServiceAreaModel extends ServiceAreaEntity {
  const ServiceAreaModel({
    required super.id,
    required super.city,
    required super.state,
    required super.country,
    required super.isActive,
  });

  factory ServiceAreaModel.fromJson(Map<String, dynamic> json) {
    return ServiceAreaModel(
      id: json['id'] as int,
      city: json['city'] as String,
      state: json['state'] as String,
      country: json['country'] as String,
      isActive: json['is_active'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'city': city,
      'state': state,
      'country': country,
      'is_active': isActive,
    };
  }

  ServiceAreaEntity toEntity() {
    return ServiceAreaEntity(
      id: id,
      city: city,
      state: state,
      country: country,
      isActive: isActive,
    );
  }

  factory ServiceAreaModel.fromEntity(ServiceAreaEntity entity) {
    return ServiceAreaModel(
      id: entity.id,
      city: entity.city,
      state: entity.state,
      country: entity.country,
      isActive: entity.isActive,
    );
  }
}