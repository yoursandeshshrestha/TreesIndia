import '../entities/search_suggestions_response_entity.dart';
import '../repositories/service_repository.dart';

class GetSearchSuggestionsUseCase {
  final ServiceRepository repository;

  const GetSearchSuggestionsUseCase(this.repository);

  Future<SearchSuggestionsResponseEntity> call() async {
    return await repository.getSearchSuggestions();
  }
}
