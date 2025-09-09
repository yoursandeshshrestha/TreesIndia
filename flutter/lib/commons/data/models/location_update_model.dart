import '../../domain/entities/location_update_entity.dart';

class LocationUpdateModel extends LocationUpdateEntity {
  const LocationUpdateModel({
    required super.latitude,
    required super.longitude,
    required super.accuracy,
  });

  factory LocationUpdateModel.fromJson(Map<String, dynamic> json) {
    return LocationUpdateModel(
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      accuracy: (json['accuracy'] ?? 0.0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      'accuracy': accuracy,
    };
  }

  factory LocationUpdateModel.fromEntity(LocationUpdateEntity entity) {
    return LocationUpdateModel(
      latitude: entity.latitude,
      longitude: entity.longitude,
      accuracy: entity.accuracy,
    );
  }

  LocationUpdateEntity toEntity() {
    return LocationUpdateEntity(
      latitude: latitude,
      longitude: longitude,
      accuracy: accuracy,
    );
  }
}