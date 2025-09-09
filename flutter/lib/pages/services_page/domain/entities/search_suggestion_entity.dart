import 'package:equatable/equatable.dart';

class SearchSuggestionEntity extends Equatable {
  final String keyword;
  final int searchCount;
  final String category;

  const SearchSuggestionEntity({
    required this.keyword,
    required this.searchCount,
    required this.category,
  });

  @override
  List<Object?> get props => [
        keyword,
        searchCount,
        category,
      ];
}