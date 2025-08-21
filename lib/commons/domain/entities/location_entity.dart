import 'package:equatable/equatable.dart';

class LocationEntity extends Equatable {
  final String address;
  final double latitude;
  final double longitude;
  final String? city;
  final String? state;
  final String? country;
  final String? postalCode;

  const LocationEntity({
    required this.address,
    required this.latitude,
    required this.longitude,
    this.city,
    this.state,
    this.country,
    this.postalCode,
  });

  @override
  List<Object?> get props => [
        address,
        latitude,
        longitude,
        city,
        state,
        country,
        postalCode,
      ];

  LocationEntity copyWith({
    String? address,
    double? latitude,
    double? longitude,
    String? city,
    String? state,
    String? country,
    String? postalCode,
  }) {
    return LocationEntity(
      address: address ?? this.address,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      city: city ?? this.city,
      state: state ?? this.state,
      country: country ?? this.country,
      postalCode: postalCode ?? this.postalCode,
    );
  }
}