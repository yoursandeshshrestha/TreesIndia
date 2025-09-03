import 'package:equatable/equatable.dart';
import '../../../../commons/domain/entities/location_entity.dart';

abstract class LocationOnboardingState extends Equatable {
  const LocationOnboardingState();

  @override
  List<Object?> get props => [];
}

class LocationOnboardingInitial extends LocationOnboardingState {}

class LocationOnboardingLoading extends LocationOnboardingState {}

class LocationOnboardingSearchResults extends LocationOnboardingState {
  final List<LocationEntity> locations;

  const LocationOnboardingSearchResults(this.locations);

  @override
  List<Object?> get props => [locations];
}

class LocationOnboardingCurrentLocationFetched extends LocationOnboardingState {
  final LocationEntity location;

  const LocationOnboardingCurrentLocationFetched(this.location);

  @override
  List<Object?> get props => [location];
}

class LocationOnboardingLocationSaved extends LocationOnboardingState {
  final LocationEntity location;

  const LocationOnboardingLocationSaved(this.location);

  @override
  List<Object?> get props => [location];
}

class LocationOnboardingError extends LocationOnboardingState {
  final String message;

  const LocationOnboardingError(this.message);

  @override
  List<Object?> get props => [message];
}

class LocationOnboardingPermissionDenied extends LocationOnboardingState {}