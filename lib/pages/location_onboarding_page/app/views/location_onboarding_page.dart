import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../commons/components/button/app/views/solid_button_widget.dart';
import '../../../../commons/constants/app_colors.dart';
import '../../../../commons/constants/app_spacing.dart';
import '../../../../commons/domain/entities/location_entity.dart';
import '../providers/location_onboarding_providers.dart';
import '../viewmodels/location_onboarding_state.dart';

class LocationOnboardingPage extends ConsumerStatefulWidget {
  const LocationOnboardingPage({super.key});

  @override
  ConsumerState<LocationOnboardingPage> createState() =>
      _LocationOnboardingPageState();
}

class _LocationOnboardingPageState
    extends ConsumerState<LocationOnboardingPage> {
  final TextEditingController _searchController = TextEditingController();
  bool _isSearchMode = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<LocationOnboardingState>(locationOnboardingNotifierProvider,
        (previous, next) {
      if (next is LocationOnboardingLocationSaved) {
        context.go('/home');
      } else if (next is LocationOnboardingError) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.message),
            backgroundColor: Colors.red,
          ),
        );
      } else if (next is LocationOnboardingPermissionDenied) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content:
                Text('Location permission is required to use this feature'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    });

    final state = ref.watch(locationOnboardingNotifierProvider);

    return Scaffold(
      backgroundColor: AppColors.brandNeutral50,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: AppSpacing.xl),
              const Text(
                'Select Your Location',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: AppSpacing.sm),
              const Text(
                'Please select your location to get better recommendations and services near you.',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: AppSpacing.xl),
              if (!_isSearchMode) ...[
                _buildLocationOptions(),
              ] else ...[
                _buildSearchInterface(state),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLocationOptions() {
    final state = ref.watch(locationOnboardingNotifierProvider);
    final isLoadingCurrentLocation = state is LocationOnboardingLoading && !_isSearchMode;

    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: SolidButtonWidget(
                label: 'Choose Location',
                icon: Icons.search,
                onPressed: isLoadingCurrentLocation ? null : () {
                  setState(() {
                    _isSearchMode = true;
                  });
                },
              ),
            )
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        Row(
          children: [
            Expanded(
              child: SolidButtonWidget(
                label: isLoadingCurrentLocation ? 'Getting Location...' : 'Use Current Location',
                icon: isLoadingCurrentLocation ? null : Icons.my_location,
                isLoading: isLoadingCurrentLocation,
                onPressed: isLoadingCurrentLocation ? null : () {
                  ref
                      .read(locationOnboardingNotifierProvider.notifier)
                      .getCurrentLocation();
                },
              ),
            )
          ],
        ),
      ],
    );
  }

  Widget _buildSearchInterface(LocationOnboardingState state) {
    return Expanded(
      child: Column(
        children: [
          Row(
            children: [
              IconButton(
                onPressed: () {
                  setState(() {
                    _isSearchMode = false;
                    _searchController.clear();
                  });
                  ref
                      .read(locationOnboardingNotifierProvider.notifier)
                      .clearState();
                },
                icon: const Icon(Icons.arrow_back),
              ),
              Expanded(
                child: TextField(
                  controller: _searchController,
                  decoration: const InputDecoration(
                    hintText: 'Search for a location...',
                    prefixIcon: Icon(Icons.search),
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (value) {
                    ref
                        .read(locationOnboardingNotifierProvider.notifier)
                        .searchLocations(value);
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Expanded(
            child: _buildSearchResults(state),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchResults(LocationOnboardingState state) {
    if (state is LocationOnboardingLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (state is LocationOnboardingSearchResults) {
      if (state.locations.isEmpty) {
        return const Center(
          child: Text('No locations found'),
        );
      }

      return ListView.builder(
        itemCount: state.locations.length,
        itemBuilder: (context, index) {
          return _buildLocationCard(state.locations[index]);
        },
      );
    }

    return const Center(
      child: Text('Start typing to search for locations'),
    );
  }

  Widget _buildLocationCard(LocationEntity location,
      {bool isCurrentLocation = false}) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: ListTile(
        leading: Icon(
          isCurrentLocation ? Icons.my_location : Icons.location_on,
          color: AppColors.brandPrimary600,
        ),
        title: Text(
          location.address,
          style: const TextStyle(fontWeight: FontWeight.w500),
        ),
        subtitle: location.city != null
            ? Text('${location.city}, ${location.state}')
            : null,
        trailing: ElevatedButton(
          onPressed: () {
            ref
                .read(locationOnboardingNotifierProvider.notifier)
                .saveLocationAndComplete(location);
          },
          child: const Text('Select'),
        ),
      ),
    );
  }
}
