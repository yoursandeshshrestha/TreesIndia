import 'package:equatable/equatable.dart';
import '../../domain/entities/search_suggestion_entity.dart';
import '../../domain/entities/service_detail_entity.dart';

enum SearchSuggestionsStatus { initial, loading, success, failure }

class SearchSuggestionsState extends Equatable {
  final SearchSuggestionsStatus status;
  final List<SearchSuggestionEntity> keywords;
  final List<ServiceDetailEntity> services;
  final String errorMessage;

  const SearchSuggestionsState({
    this.status = SearchSuggestionsStatus.initial,
    this.keywords = const [],
    this.services = const [],
    this.errorMessage = '',
  });

  SearchSuggestionsState copyWith({
    SearchSuggestionsStatus? status,
    List<SearchSuggestionEntity>? keywords,
    List<ServiceDetailEntity>? services,
    String? errorMessage,
  }) {
    return SearchSuggestionsState(
      status: status ?? this.status,
      keywords: keywords ?? this.keywords,
      services: services ?? this.services,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object> get props => [status, keywords, services, errorMessage];
}
