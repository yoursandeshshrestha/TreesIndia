import 'package:equatable/equatable.dart';
import 'search_suggestion_entity.dart';
import 'service_detail_entity.dart';

class SearchSuggestionsResponseEntity extends Equatable {
  final bool success;
  final String message;
  final List<SearchSuggestionEntity> keywords;
  final List<ServiceDetailEntity> services;
  final DateTime timestamp;

  const SearchSuggestionsResponseEntity({
    required this.success,
    required this.message,
    required this.keywords,
    required this.services,
    required this.timestamp,
  });

  @override
  List<Object?> get props => [
        success,
        message,
        keywords,
        services,
        timestamp,
      ];
}
