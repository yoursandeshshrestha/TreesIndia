import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../commons/constants/app_colors.dart';
import '../../../../commons/constants/app_spacing.dart';
import '../../../home_page/app/providers/home_page_providers.dart';

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
    _searchFocusNode = FocusNode();

    // Focus the search field immediately when page opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _searchFocusNode.requestFocus();
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
    final homePageState = ref.watch(homePageNotifierProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.brandNeutral900),
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
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 12,
              ),
            ),
            onChanged: (value) {
              // TODO: Implement real-time search
              print('Search: $value');
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
            // Popular Searches Section
            if (homePageState.searchSuggestions.isNotEmpty) ...[
              H4Bold(
                text: 'Popular Searches',
                color: AppColors.brandNeutral900,
              ),
              const SizedBox(height: AppSpacing.md),

              // Search suggestion chips
              Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: homePageState.searchSuggestions.map((suggestion) {
                  return GestureDetector(
                    onTap: () {
                      _searchController.text = suggestion.keyword;
                      // TODO: Perform search with this keyword
                      print('Suggestion tapped: ${suggestion.keyword}');
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
            if (homePageState.popularServices.isNotEmpty) ...[
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
                itemCount: homePageState.popularServices.length,
                itemBuilder: (context, index) {
                  final service = homePageState.popularServices[index];
                  return GestureDetector(
                    onTap: () {
                      // TODO: Navigate to service detail page
                      print('Service tapped: ${service.name}');
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
                                      errorBuilder:
                                          (context, error, stackTrace) {
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
            if (homePageState.isLoadingSearchSuggestions ||
                homePageState.isLoadingPopularServices)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(AppSpacing.xl),
                  child: CircularProgressIndicator(
                    color: Color(0xFF055c3a),
                  ),
                ),
              ),

            // Empty state
            if (homePageState.searchSuggestions.isEmpty &&
                homePageState.popularServices.isEmpty &&
                !homePageState.isLoadingSearchSuggestions &&
                !homePageState.isLoadingPopularServices)
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
        ),
      ),
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
