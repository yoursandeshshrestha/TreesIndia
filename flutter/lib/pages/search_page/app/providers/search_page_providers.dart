import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../app/viewmodels/search_page_notifier.dart';
import '../../app/viewmodels/search_page_state.dart';
import '../../../services_page/domain/usecases/search_services_usecase.dart';
import '../../../services_page/app/providers/service_providers.dart';

final searchServicesUseCaseProvider = Provider<SearchServicesUseCase>((ref) {
  final repository = ref.watch(serviceRepositoryProvider);
  return SearchServicesUseCase(repository: repository);
});

final searchPageNotifierProvider =
    StateNotifierProvider<SearchPageNotifier, SearchPageState>((ref) {
  final getSearchSuggestionsUseCase =
      ref.watch(getSearchSuggestionsUseCaseProvider);
  final getPopularServicesUseCase = ref.watch(getPopularServicesUseCaseProvider);
  final searchServicesUseCase = ref.watch(searchServicesUseCaseProvider);

  return SearchPageNotifier(
    getSearchSuggestionsUseCase: getSearchSuggestionsUseCase,
    getPopularServicesUseCase: getPopularServicesUseCase,
    searchServicesUseCase: searchServicesUseCase,
  );
});