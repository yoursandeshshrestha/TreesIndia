import '../../domain/entities/location_entity.dart';

class LocationModel extends LocationEntity {
  const LocationModel({
    required super.address,
    required super.latitude,
    required super.longitude,
    super.city,
    super.state,
    super.country,
    super.postalCode,
  });

  factory LocationModel.fromJson(Map<String, dynamic> json) {
    return LocationModel(
      address: json['address'] ?? '',
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      city: json['city'],
      state: json['state'],
      country: json['country'],
      postalCode: json['postalCode'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'address': address,
      'latitude': latitude,
      'longitude': longitude,
      'city': city,
      'state': state,
      'country': country,
      'postalCode': postalCode,
    };
  }

  factory LocationModel.fromEntity(LocationEntity entity) {
    return LocationModel(
      address: entity.address,
      latitude: entity.latitude,
      longitude: entity.longitude,
      city: entity.city,
      state: entity.state,
      country: entity.country,
      postalCode: entity.postalCode,
    );
  }

  LocationEntity toEntity() {
    return LocationEntity(
      address: address,
      latitude: latitude,
      longitude: longitude,
      city: city,
      state: state,
      country: country,
      postalCode: postalCode,
    );
  }
}