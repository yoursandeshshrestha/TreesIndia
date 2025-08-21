import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/location_providers.dart';
import '../../utils/services/location_onboarding_service.dart';
import 'local_storage_provider.dart';

final locationOnboardingServiceProvider =
    Provider<LocationOnboardingService>((ref) {
  final localStorage = ref.watch(localStorageServiceProvider);
  final locationService = ref.watch(locationServiceProvider);
  return LocationOnboardingService(localStorage, locationService);
});
