import 'package:equatable/equatable.dart';
import '../../domain/entities/search_metadata_entity.dart';

class SearchMetadataModel extends Equatable {
  final String query;
  final int searchTimeMs;
  final int totalResults;

  const SearchMetadataModel({
    required this.query,
    required this.searchTimeMs,
    required this.totalResults,
  });

  factory SearchMetadataModel.fromJson(Map<String, dynamic> json) {
    return SearchMetadataModel(
      query: json['query'] as String? ?? '',
      searchTimeMs: json['search_time_ms'] as int? ?? 0,
      totalResults: json['total_results'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'query': query,
      'search_time_ms': searchTimeMs,
      'total_results': totalResults,
    };
  }

  SearchMetadataEntity toEntity() {
    return SearchMetadataEntity(
      query: query,
      searchTimeMs: searchTimeMs,
      totalResults: totalResults,
    );
  }

  @override
  List<Object?> get props => [
        query,
        searchTimeMs,
        totalResults,
      ];
}