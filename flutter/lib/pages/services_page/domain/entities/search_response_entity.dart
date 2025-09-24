import 'package:equatable/equatable.dart';
import 'query_analysis_entity.dart';
import 'search_result_entity.dart';
import 'pagination_entity.dart';
import 'search_metadata_entity.dart';

class SearchResponseEntity extends Equatable {
  final bool success;
  final String message;
  final QueryAnalysisEntity queryAnalysis;
  final List<SearchResultEntity> results;
  final PaginationEntity pagination;
  final SearchMetadataEntity searchMetadata;
  final DateTime timestamp;

  const SearchResponseEntity({
    required this.success,
    required this.message,
    required this.queryAnalysis,
    required this.results,
    required this.pagination,
    required this.searchMetadata,
    required this.timestamp,
  });

  @override
  List<Object?> get props => [
        success,
        message,
        queryAnalysis,
        results,
        pagination,
        searchMetadata,
        timestamp,
      ];
}