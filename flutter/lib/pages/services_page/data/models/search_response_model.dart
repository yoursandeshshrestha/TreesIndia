import 'package:equatable/equatable.dart';
import 'query_analysis_model.dart';
import 'search_result_model.dart';
import 'pagination_model.dart';
import 'search_metadata_model.dart';
import '../../domain/entities/search_response_entity.dart';

class SearchDataModel extends Equatable {
  final QueryAnalysisModel queryAnalysis;
  final List<SearchResultModel> results;
  final PaginationModel pagination;
  final SearchMetadataModel searchMetadata;

  const SearchDataModel({
    required this.queryAnalysis,
    required this.results,
    required this.pagination,
    required this.searchMetadata,
  });

  factory SearchDataModel.fromJson(Map<String, dynamic> json) {
    return SearchDataModel(
      queryAnalysis: QueryAnalysisModel.fromJson(
          json['query_analysis'] as Map<String, dynamic>? ?? {}),
      results: (json['results'] as List<dynamic>?)
              ?.map((result) => SearchResultModel.fromJson(
                  result as Map<String, dynamic>))
              .toList() ??
          [],
      pagination: PaginationModel.fromJson(
          json['pagination'] as Map<String, dynamic>? ?? {}),
      searchMetadata: SearchMetadataModel.fromJson(
          json['search_metadata'] as Map<String, dynamic>? ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'query_analysis': queryAnalysis.toJson(),
      'results': results.map((result) => result.toJson()).toList(),
      'pagination': pagination.toJson(),
      'search_metadata': searchMetadata.toJson(),
    };
  }

  @override
  List<Object?> get props => [
        queryAnalysis,
        results,
        pagination,
        searchMetadata,
      ];
}

class SearchResponseModel extends Equatable {
  final bool success;
  final String message;
  final SearchDataModel data;
  final DateTime timestamp;

  const SearchResponseModel({
    required this.success,
    required this.message,
    required this.data,
    required this.timestamp,
  });

  factory SearchResponseModel.fromJson(Map<String, dynamic> json) {
    return SearchResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: SearchDataModel.fromJson(
          json['data'] as Map<String, dynamic>? ?? {}),
      timestamp: DateTime.tryParse(json['timestamp'] as String? ?? '') ??
          DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': data.toJson(),
      'timestamp': timestamp.toIso8601String(),
    };
  }

  SearchResponseEntity toEntity() {
    return SearchResponseEntity(
      success: success,
      message: message,
      queryAnalysis: data.queryAnalysis.toEntity(),
      results: data.results.map((result) => result.toEntity()).toList(),
      pagination: data.pagination.toEntity(),
      searchMetadata: data.searchMetadata.toEntity(),
      timestamp: timestamp,
    );
  }

  @override
  List<Object?> get props => [
        success,
        message,
        data,
        timestamp,
      ];
}