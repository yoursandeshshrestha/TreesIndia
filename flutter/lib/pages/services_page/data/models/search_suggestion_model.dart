import '../../domain/entities/search_suggestion_entity.dart';

class SearchSuggestionModel extends SearchSuggestionEntity {
  const SearchSuggestionModel({
    required super.keyword,
    required super.searchCount,
    required super.category,
  });

  factory SearchSuggestionModel.fromJson(Map<String, dynamic> json) {
    return SearchSuggestionModel(
      keyword: json['keyword'] as String? ?? '',
      searchCount: json['search_count'] as int? ?? 0,
      category: json['category'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'keyword': keyword,
      'search_count': searchCount,
      'category': category,
    };
  }

  SearchSuggestionEntity toEntity() {
    return SearchSuggestionEntity(
      keyword: keyword,
      searchCount: searchCount,
      category: category,
    );
  }

  factory SearchSuggestionModel.fromEntity(SearchSuggestionEntity entity) {
    return SearchSuggestionModel(
      keyword: entity.keyword,
      searchCount: entity.searchCount,
      category: entity.category,
    );
  }
}