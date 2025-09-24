import 'package:equatable/equatable.dart';

class SearchMetadataEntity extends Equatable {
  final String query;
  final int searchTimeMs;
  final int totalResults;

  const SearchMetadataEntity({
    required this.query,
    required this.searchTimeMs,
    required this.totalResults,
  });

  @override
  List<Object?> get props => [
        query,
        searchTimeMs,
        totalResults,
      ];
}