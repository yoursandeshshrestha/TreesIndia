import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/get_popular_services_usecase.dart';
import 'popular_services_state.dart';

class PopularServicesNotifier extends StateNotifier<PopularServicesState> {
  final GetPopularServicesUseCase getPopularServicesUseCase;

  PopularServicesNotifier({required this.getPopularServicesUseCase})
      : super(const PopularServicesState());

  Future<void> loadPopularServices() async {
    state = state.copyWith(status: PopularServicesStatus.loading);

    try {
      final response = await getPopularServicesUseCase();
      state = state.copyWith(
        status: PopularServicesStatus.success,
        services: response.data,
      );
    } catch (error) {
      state = state.copyWith(
        status: PopularServicesStatus.failure,
        errorMessage: error.toString(),
      );
    }
  }

  void clearPopularServices() {
    state = const PopularServicesState();
  }
}
