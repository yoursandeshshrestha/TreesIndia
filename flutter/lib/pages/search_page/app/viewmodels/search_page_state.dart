import 'package:equatable/equatable.dart';
import '../../../services_page/domain/entities/search_suggestion_entity.dart';
import '../../../services_page/domain/entities/service_detail_entity.dart';
import '../../../services_page/domain/entities/search_result_entity.dart';
import '../../../services_page/domain/entities/pagination_entity.dart';
import '../../../services_page/domain/entities/search_metadata_entity.dart';

class SearchPageState extends Equatable {
  final bool isLoadingSearchSuggestions;
  final bool isLoadingPopularServices;
  final bool isSearching;
  final List<SearchSuggestionEntity> searchSuggestions;
  final List<ServiceDetailEntity> popularServices;
  final List<SearchResultEntity> searchResults;
  final PaginationEntity? pagination;
  final SearchMetadataEntity? searchMetadata;
  final String currentQuery;
  final String errorMessage;

  const SearchPageState({
    this.isLoadingSearchSuggestions = false,
    this.isLoadingPopularServices = false,
    this.isSearching = false,
    this.searchSuggestions = const [],
    this.popularServices = const [],
    this.searchResults = const [],
    this.pagination,
    this.searchMetadata,
    this.currentQuery = '',
    this.errorMessage = '',
  });

  SearchPageState copyWith({
    bool? isLoadingSearchSuggestions,
    bool? isLoadingPopularServices,
    bool? isSearching,
    List<SearchSuggestionEntity>? searchSuggestions,
    List<ServiceDetailEntity>? popularServices,
    List<SearchResultEntity>? searchResults,
    PaginationEntity? pagination,
    SearchMetadataEntity? searchMetadata,
    String? currentQuery,
    String? errorMessage,
  }) {
    return SearchPageState(
      isLoadingSearchSuggestions:
          isLoadingSearchSuggestions ?? this.isLoadingSearchSuggestions,
      isLoadingPopularServices:
          isLoadingPopularServices ?? this.isLoadingPopularServices,
      isSearching: isSearching ?? this.isSearching,
      searchSuggestions: searchSuggestions ?? this.searchSuggestions,
      popularServices: popularServices ?? this.popularServices,
      searchResults: searchResults ?? this.searchResults,
      pagination: pagination ?? this.pagination,
      searchMetadata: searchMetadata ?? this.searchMetadata,
      currentQuery: currentQuery ?? this.currentQuery,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        isLoadingSearchSuggestions,
        isLoadingPopularServices,
        isSearching,
        searchSuggestions,
        popularServices,
        searchResults,
        pagination,
        searchMetadata,
        currentQuery,
        errorMessage,
      ];
}