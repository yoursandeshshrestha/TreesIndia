import 'package:equatable/equatable.dart';

class QueryAnalysisEntity extends Equatable {
  final String originalQuery;
  final String detectedType;
  final Map<String, dynamic> parsedFilters;

  const QueryAnalysisEntity({
    required this.originalQuery,
    required this.detectedType,
    required this.parsedFilters,
  });

  @override
  List<Object?> get props => [
        originalQuery,
        detectedType,
        parsedFilters,
      ];
}