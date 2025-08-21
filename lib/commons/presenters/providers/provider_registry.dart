// lib/commons/providers/provider_registry.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Add the ResettableNotifier mixin
mixin ResettableNotifier<T> on StateNotifier<T> {
  void reset();
}

class ProviderRegistry {
  static final List<ProviderOrFamily> _providers = [];

  static void register(ProviderOrFamily provider) {
    _providers.add(provider);
  }

  static void registerAll(List<ProviderOrFamily> providers) {
    _providers.addAll(providers);
  }

  static void resetAll(ProviderContainer container) {
    final sortedProviders = _sortProviders(_providers);

    // First dispose state notifier providers that implement ResettableNotifier
    for (final provider in sortedProviders) {
      if (provider is StateNotifierProvider) {
        try {
          final notifier = container.read(provider.notifier);
          if (notifier is ResettableNotifier) {
            notifier.reset();
          }
        } catch (e) {
          print('Error resetting provider: $e');
          // Ignore errors during reset
        }
      }
    }

    // Then invalidate all providers
    for (final provider in _providers) {
      try {
        container.invalidate(provider);
      } catch (e) {
        print('Error invalidating provider: $e');
        // Ignore errors during invalidation
      }
    }
  }

  // Helper method to sort providers based on dependencies
  static List<ProviderOrFamily> _sortProviders(
      List<ProviderOrFamily> providers) {
    // Start with providers that have no dependencies
    final sorted =
        providers.where((p) => p is Provider || p is StateProvider).toList();

    // Then add state notifier providers
    sorted.addAll(providers.whereType<StateNotifierProvider>());

    // Finally add any remaining providers
    sorted.addAll(providers.where((p) => !sorted.contains(p)));

    return sorted;
  }

  static void clear() {
    _providers.clear();
  }
}

// Extension to make registration more convenient
extension ProviderRegistration on ProviderOrFamily {
  void registerProvider() {
    ProviderRegistry.register(this);
  }
}
