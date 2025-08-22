import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import '../../../../commons/constants/app_colors.dart';
import '../../../../commons/constants/app_spacing.dart';
import '../../../../commons/domain/entities/location_entity.dart';
import '../../../../commons/presenters/providers/location_onboarding_provider.dart';
import '../../../location_onboarding_page/app/providers/location_onboarding_providers.dart';
import '../../../location_onboarding_page/app/viewmodels/location_onboarding_state.dart';

class ManualLocationPage extends ConsumerStatefulWidget {
  const ManualLocationPage({super.key});

  @override
  ConsumerState<ManualLocationPage> createState() => _ManualLocationPageState();
}

class _ManualLocationPageState extends ConsumerState<ManualLocationPage> {
  final TextEditingController _searchController = TextEditingController();
  bool? _isFirstLogin;

  @override
  void initState() {
    super.initState();
    _checkFirstLoginStatus();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _checkFirstLoginStatus() async {
    try {
      final locationService = ref.read(locationOnboardingServiceProvider);
      final isFirstLogin = await locationService.isFirstLogin();
      if (mounted) {
        setState(() {
          _isFirstLogin = isFirstLogin;
        });
      }
    } catch (e) {
      debugPrint('Error checking first login status: $e');
      if (mounted) {
        setState(() {
          _isFirstLogin = true;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<LocationOnboardingState>(locationOnboardingNotifierProvider,
        (previous, next) {
      if (next is LocationOnboardingLocationSaved) {
        if (_isFirstLogin == true) {
          context.go('/location-loading');
        } else {
          Navigator.of(context).pop(true);
        }
      } else if (next is LocationOnboardingError) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: B3Medium(text: next.message),
            backgroundColor: Colors.red,
          ),
        );
      }
    });

    final state = ref.watch(locationOnboardingNotifierProvider);

    return Scaffold(
      backgroundColor: AppColors.brandNeutral50,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            AppSpacing.sm,
            AppSpacing.lg,
            AppSpacing.lg,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  GestureDetector(
                    onTap: () => context.pop(),
                    child: const Icon(Icons.arrow_back,
                        color: AppColors.brandNeutral900),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: _buildSearchBar(),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xs),
              _buildUseCurrentLocationButton(),
              const SizedBox(height: AppSpacing.xs),
              const Divider(color: AppColors.brandNeutral300),
              const SizedBox(height: AppSpacing.md),
              Expanded(
                child: _buildSearchResults(state),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return TextField(
      controller: _searchController,
      decoration: InputDecoration(
        hintText: 'Search for a location...',
        prefixIcon: const Icon(Icons.search, color: AppColors.brandNeutral500),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.brandNeutral300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.brandNeutral300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.brandPrimary600),
        ),
        filled: true,
        fillColor: Colors.white,
      ),
      onChanged: (value) {
        ref
            .read(locationOnboardingNotifierProvider.notifier)
            .searchLocations(value);
      },
    );
  }

  Widget _buildUseCurrentLocationButton() {
    final state = ref.watch(locationOnboardingNotifierProvider);
    final isLoading = state is LocationOnboardingLoading;

    return Row(
      children: [
        const Icon(
          Icons.my_location,
          color: AppColors.brandPrimary600,
          size: 20,
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: TextButton(
            onPressed: isLoading
                ? null
                : () {
                    ref
                        .read(locationOnboardingNotifierProvider.notifier)
                        .getCurrentLocation(
                            isFirstLogin: _isFirstLogin ?? true);
                  },
            style: TextButton.styleFrom(
              padding: EdgeInsets.zero,
              alignment: Alignment.centerLeft,
            ),
            child: B2Medium(
              text: isLoading
                  ? 'Getting your location...'
                  : 'Use current location',
              color: isLoading
                  ? AppColors.brandNeutral500
                  : AppColors.brandPrimary600,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSearchResults(LocationOnboardingState state) {
    if (state is LocationOnboardingLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (state is LocationOnboardingSearchResults) {
      if (state.locations.isEmpty && _searchController.text.isNotEmpty) {
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.location_off,
                size: 64,
                color: AppColors.brandNeutral400,
              ),
              const SizedBox(height: AppSpacing.md),
              B2Medium(
                text: 'No locations found',
                color: AppColors.brandNeutral600,
              ),
              const SizedBox(height: AppSpacing.sm),
              B3Regular(
                text: 'Try searching with a different term',
                color: AppColors.brandNeutral500,
              ),
            ],
          ),
        );
      }

      return ListView.builder(
        itemCount: state.locations.length,
        itemBuilder: (context, index) {
          return _buildLocationCard(state.locations[index]);
        },
      );
    }

    // Check if user has typed something but it's too short
    if (_searchController.text.trim().isNotEmpty &&
        _searchController.text.trim().length < 3) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.keyboard,
              size: 64,
              color: AppColors.brandNeutral400,
            ),
            const SizedBox(height: AppSpacing.md),
            B2Medium(
              text: 'Type at least 3 characters',
              color: AppColors.brandNeutral600,
            ),
            const SizedBox(height: AppSpacing.sm),
            B3Regular(
              text: 'Continue typing to see location suggestions',
              color: AppColors.brandNeutral500,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.search,
            size: 64,
            color: AppColors.brandNeutral400,
          ),
          const SizedBox(height: AppSpacing.md),
          B2Medium(
            text: 'Start typing to search',
            color: AppColors.brandNeutral600,
          ),
          const SizedBox(height: AppSpacing.sm),
          B3Regular(
            text: 'Enter your location to see suggestions',
            color: AppColors.brandNeutral500,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildLocationCard(LocationEntity location) {
    return InkWell(
      onTap: () {
        ref
            .read(locationOnboardingNotifierProvider.notifier)
            .saveLocationAndComplete(location,
                isFirstLogin: _isFirstLogin ?? true);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(
            vertical: AppSpacing.md, horizontal: AppSpacing.sm),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.brandNeutral200,
              ),
              child: const Icon(
                Icons.location_on,
                color: AppColors.brandNeutral600,
                size: 18,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  B2Medium(
                    text: location.address,
                    color: AppColors.brandNeutral900,
                  ),
                  if (location.city != null) ...[
                    const SizedBox(height: 2),
                    B3Regular(
                      text: '${location.city}, ${location.state}',
                      color: AppColors.brandNeutral600,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
