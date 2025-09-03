import 'package:trees_india/commons/constants/enums.dart';

class LocationState {
  final double? latitude;
  final double? longitude;
  final LocationStatus status;

  const LocationState({
    this.latitude,
    this.longitude,
    required this.status,
  });

  LocationState copyWith({
    double? latitude,
    double? longitude,
    LocationStatus? status,
  }) {
    return LocationState(
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      status: status ?? this.status,
    );
  }

  @override
  String toString() {
    return 'LocationState(latitude: $latitude, longitude: $longitude, status: $status)';
  }
}
