import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../commons/presenters/providers/location_onboarding_provider.dart';
import '../viewmodels/location_onboarding_notifier.dart';
import '../viewmodels/location_onboarding_state.dart';

final locationOnboardingNotifierProvider = 
    StateNotifierProvider<LocationOnboardingNotifier, LocationOnboardingState>((ref) {
  final locationService = ref.watch(locationOnboardingServiceProvider);
  return LocationOnboardingNotifier(locationService);
});