import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../utils/services/location_onboarding_service.dart';
import 'local_storage_provider.dart';

final locationOnboardingServiceProvider = Provider<LocationOnboardingService>((ref) {
  final localStorage = ref.watch(localStorageServiceProvider);
  return LocationOnboardingService(localStorage);
});