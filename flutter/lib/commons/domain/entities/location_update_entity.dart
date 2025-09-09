import 'package:equatable/equatable.dart';

class LocationUpdateEntity extends Equatable {
  final double latitude;
  final double longitude;
  final double accuracy;

  const LocationUpdateEntity({
    required this.latitude,
    required this.longitude,
    required this.accuracy,
  });

  @override
  List<Object> get props => [latitude, longitude, accuracy];

  LocationUpdateEntity copyWith({
    double? latitude,
    double? longitude,
    double? accuracy,
  }) {
    return LocationUpdateEntity(
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      accuracy: accuracy ?? this.accuracy,
    );
  }
}