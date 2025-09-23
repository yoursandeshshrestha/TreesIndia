import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/components/connectivity/connectivity_provider.dart';
import 'package:trees_india/commons/presenters/providers/notification_service_provider.dart';
import 'package:trees_india/pages/search_page/app/viewmodels/search_page_state.dart';
import 'package:trees_india/pages/services_page/domain/entities/search_result_entity.dart';
import '../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../commons/constants/app_colors.dart';
import '../../../../commons/constants/app_spacing.dart';
import '../providers/search_page_providers.dart';

class SearchPage extends ConsumerStatefulWidget {
  const SearchPage({super.key});

  @override
  ConsumerState<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends ConsumerState<SearchPage> {
  late TextEditingController _searchController;
  late FocusNode _searchFocusNode;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    _searchController.addListener(() {
      setState(() {});
    });
    _searchFocusNode = FocusNode();

    // Load search suggestions and popular services when page opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _searchFocusNode.requestFocus();
      ref.read(searchPageNotifierProvider.notifier).loadSearchSuggestions();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final searchPageState = ref.watch(searchPageNotifierProvider);
    final isConnected = ref.watch(connectivityNotifierProvider);
    if (!isConnected) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(notificationServiceProvider).showOfflineMessage(
              context,
              onRetry: () => debugPrint('Retrying…'),
            );
      });
    }

    return PopScope(
      onPopInvokedWithResult: (didPop, result) {
        ref.invalidate(searchPageNotifierProvider);
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon:
                const Icon(Icons.arrow_back, color: AppColors.brandNeutral900),
            onPressed: () => context.pop(),
          ),
          title: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: AppColors.brandNeutral200,
                width: 1,
              ),
            ),
            child: TextField(
              controller: _searchController,
              focusNode: _searchFocusNode,
              decoration: InputDecoration(
                hintText: 'Search for services...',
                hintStyle: const TextStyle(
                  fontSize: 14,
                  color: AppColors.brandNeutral400,
                ),
                prefixIcon: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Image.asset(
                    'assets/icons/search.png',
                    width: 20,
                    height: 20,
                    color: AppColors.brandNeutral600,
                    errorBuilder: (context, error, stackTrace) {
                      return const Icon(
                        Icons.search,
                        size: 20,
                        color: AppColors.brandNeutral600,
                      );
                    },
                  ),
                ),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear,
                            color: AppColors.brandNeutral600),
                        onPressed: () {
                          _searchController.clear();
                          ref
                              .read(searchPageNotifierProvider.notifier)
                              .clearSearch();
                        },
                      )
                    : null,
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
              ),
              onChanged: (value) {
                ref
                    .read(searchPageNotifierProvider.notifier)
                    .searchServices(value);
              },
              onTapOutside: (_) => FocusScope.of(context).unfocus(),
            ),
          ),
          centerTitle: false,
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Show search results if user has searched
              if (searchPageState.currentQuery.isNotEmpty) ...[
                _buildSearchResults(searchPageState),
              ] else ...[
                // Show suggestions and popular services when no search
                _buildSearchSuggestions(searchPageState),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSearchResults(SearchPageState searchPageState) {
    if (searchPageState.isSearching) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(AppSpacing.xl),
          child: CircularProgressIndicator(
            color: Color(0xFF055c3a),
          ),
        ),
      );
    }

    if (searchPageState.errorMessage.isNotEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Column(
            children: [
              const Icon(
                Icons.error_outline,
                size: 64,
                color: AppColors.brandNeutral300,
              ),
              const SizedBox(height: AppSpacing.md),
              H4Bold(
                text: 'Error occurred',
                color: AppColors.brandNeutral600,
              ),
              const SizedBox(height: AppSpacing.sm),
              B3Regular(
                text: searchPageState.errorMessage,
                color: AppColors.brandNeutral500,
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Search results header
        if (searchPageState.searchMetadata != null) ...[
          Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.md),
            child: Row(
              children: [
                H4Bold(
                  text: 'Search Results',
                  color: AppColors.brandNeutral900,
                ),
                const Spacer(),
                B3Regular(
                  text:
                      '${searchPageState.searchMetadata!.totalResults} results',
                  color: AppColors.brandNeutral600,
                ),
              ],
            ),
          ),
        ],

        // Search results list
        if (searchPageState.searchResults.isNotEmpty) ...[
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: searchPageState.searchResults.length,
            itemBuilder: (context, index) {
              final result = searchPageState.searchResults[index];
              return _buildSearchResultCard(result);
            },
          ),
        ] else ...[
          Center(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: Column(
                children: [
                  const Icon(
                    Icons.search_off,
                    size: 64,
                    color: AppColors.brandNeutral300,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  H4Bold(
                    text: 'No results found',
                    color: AppColors.brandNeutral600,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  B3Regular(
                    text: 'Try searching with different keywords',
                    color: AppColors.brandNeutral500,
                  ),
                ],
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildSearchResultCard(SearchResultEntity result) {
    return GestureDetector(
      onTap: () {
        // context.push(
        //   '/service-detail/${result.id}',
        //   extra: {
        //     'service': ServiceDetailEntity(),
        //   },
        // );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.md),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.brandNeutral200,
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Service name and rating
              Row(
                children: [
                  Expanded(
                    child: B2Bold(
                      text: result.name,
                      color: AppColors.brandNeutral900,
                    ),
                  ),
                  if (result.rating != null) ...[
                    const Icon(
                      Icons.star,
                      size: 16,
                      color: Colors.amber,
                    ),
                    const SizedBox(width: 4),
                    B4Regular(
                      text: result.rating!.toStringAsFixed(1),
                      color: AppColors.brandNeutral700,
                    ),
                  ],
                ],
              ),

              const SizedBox(height: AppSpacing.sm),

              // Category and subcategory
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.sm,
                      vertical: AppSpacing.xs,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.brandNeutral100,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: B4Regular(
                      text: result.category,
                      color: AppColors.brandNeutral700,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.sm,
                      vertical: AppSpacing.xs,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFF055c3a).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: B4Regular(
                      text: result.subcategory,
                      color: const Color(0xFF055c3a),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.sm),

              // Description
              B3Regular(
                text: result.description,
                color: AppColors.brandNeutral600,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),

              const SizedBox(height: AppSpacing.sm),

              // Price and duration
              Row(
                children: [
                  if (result.price != null) ...[
                    B3Bold(
                      text: '₹${result.price}',
                      color: const Color(0xFF055c3a),
                    ),
                  ] else ...[
                    B3Bold(
                      text: 'Inquiry Based',
                      color: const Color(0xFF055c3a),
                    ),
                  ],
                  const Spacer(),
                  if (result.duration != null) ...[
                    const Icon(
                      Icons.access_time,
                      size: 16,
                      color: AppColors.brandNeutral500,
                    ),
                    const SizedBox(width: 4),
                    B4Regular(
                      text: result.duration!,
                      color: AppColors.brandNeutral600,
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSearchSuggestions(SearchPageState searchPageState) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Popular Searches Section
        if (searchPageState.searchSuggestions.isNotEmpty) ...[
          H4Bold(
            text: 'Popular Searches',
            color: AppColors.brandNeutral900,
          ),
          const SizedBox(height: AppSpacing.md),

          // Search suggestion chips
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: searchPageState.searchSuggestions.map((suggestion) {
              return GestureDetector(
                onTap: () {
                  _searchController.text = suggestion.keyword;
                  ref
                      .read(searchPageNotifierProvider.notifier)
                      .searchWithKeyword(suggestion.keyword);
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.brandNeutral100,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: AppColors.brandNeutral200,
                      width: 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.trending_up,
                        size: 16,
                        color: AppColors.brandNeutral600,
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      B3Regular(
                        text: suggestion.keyword,
                        color: AppColors.brandNeutral700,
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: AppSpacing.xl),
        ],

        // Popular Services Section
        if (searchPageState.popularServices.isNotEmpty) ...[
          H4Bold(
            text: 'Popular Services',
            color: AppColors.brandNeutral900,
          ),
          const SizedBox(height: AppSpacing.md),

          // Services grid
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: AppSpacing.md,
              mainAxisSpacing: AppSpacing.md,
              childAspectRatio: 0.8,
            ),
            itemCount: searchPageState.popularServices.length,
            itemBuilder: (context, index) {
              final service = searchPageState.popularServices[index];
              return GestureDetector(
                onTap: () {
                  context.push(
                    '/service-detail/${service.id}',
                    extra: {
                      'service': service,
                    },
                  );
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppColors.brandNeutral200,
                      width: 1,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Service image placeholder
                      Container(
                        height: 100,
                        width: double.infinity,
                        decoration: const BoxDecoration(
                          color: AppColors.brandNeutral100,
                          borderRadius: BorderRadius.only(
                            topLeft: Radius.circular(12),
                            topRight: Radius.circular(12),
                          ),
                        ),
                        child: service.images?.isNotEmpty == true
                            ? ClipRRect(
                                borderRadius: const BorderRadius.only(
                                  topLeft: Radius.circular(12),
                                  topRight: Radius.circular(12),
                                ),
                                child: Image.network(
                                  service.images!.first,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return _buildImagePlaceholder();
                                  },
                                ),
                              )
                            : _buildImagePlaceholder(),
                      ),

                      // Service details
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.all(AppSpacing.sm),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Service name
                              B3Bold(
                                text: service.name,
                                color: AppColors.brandNeutral900,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),

                              const SizedBox(height: AppSpacing.xs),

                              // Price and duration
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        B4Bold(
                                          text: service.priceType == 'fixed'
                                              ? 'Fixed Price'
                                              : 'Inquiry Based',
                                          color: const Color(0xFF055c3a),
                                        ),
                                        B4Regular(
                                          text: service.price != null
                                              ? '₹${service.price}'
                                              : 'Inquiry Based',
                                          color: AppColors.brandNeutral700,
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (service.duration != null)
                                    Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(
                                          Icons.access_time,
                                          size: 14,
                                          color: AppColors.brandNeutral500,
                                        ),
                                        const SizedBox(width: 4),
                                        B4Regular(
                                          text: service.duration!,
                                          color: AppColors.brandNeutral600,
                                        ),
                                      ],
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],

        // Loading state
        if (searchPageState.isLoadingSearchSuggestions ||
            searchPageState.isLoadingPopularServices)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(AppSpacing.xl),
              child: CircularProgressIndicator(
                color: Color(0xFF055c3a),
              ),
            ),
          ),

        // Empty state
        if (searchPageState.searchSuggestions.isEmpty &&
            searchPageState.popularServices.isEmpty &&
            !searchPageState.isLoadingSearchSuggestions &&
            !searchPageState.isLoadingPopularServices)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: Column(
                children: [
                  const Icon(
                    Icons.search_off,
                    size: 64,
                    color: AppColors.brandNeutral300,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  H4Bold(
                    text: 'No suggestions available',
                    color: AppColors.brandNeutral600,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  B3Regular(
                    text: 'Try searching for a service',
                    color: AppColors.brandNeutral500,
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildImagePlaceholder() {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.brandNeutral100,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(12),
          topRight: Radius.circular(12),
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.cloud_upload_outlined,
            size: 32,
            color: AppColors.brandNeutral400,
          ),
          const SizedBox(height: AppSpacing.xs),
          B4Regular(
            text: 'No Image',
            color: AppColors.brandNeutral500,
          ),
        ],
      ),
    );
  }
}
