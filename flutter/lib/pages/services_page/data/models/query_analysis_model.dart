import 'package:equatable/equatable.dart';
import '../../domain/entities/query_analysis_entity.dart';

class QueryAnalysisModel extends Equatable {
  final String originalQuery;
  final String detectedType;
  final Map<String, dynamic> parsedFilters;

  const QueryAnalysisModel({
    required this.originalQuery,
    required this.detectedType,
    required this.parsedFilters,
  });

  factory QueryAnalysisModel.fromJson(Map<String, dynamic> json) {
    return QueryAnalysisModel(
      originalQuery: json['original_query'] as String? ?? '',
      detectedType: json['detected_type'] as String? ?? '',
      parsedFilters: json['parsed_filters'] as Map<String, dynamic>? ?? {},
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'original_query': originalQuery,
      'detected_type': detectedType,
      'parsed_filters': parsedFilters,
    };
  }

  QueryAnalysisEntity toEntity() {
    return QueryAnalysisEntity(
      originalQuery: originalQuery,
      detectedType: detectedType,
      parsedFilters: parsedFilters,
    );
  }

  @override
  List<Object?> get props => [
        originalQuery,
        detectedType,
        parsedFilters,
      ];
}