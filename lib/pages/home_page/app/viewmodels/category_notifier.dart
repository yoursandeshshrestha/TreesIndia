import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/get_categories_usecase.dart';
import 'category_state.dart';

class CategoryNotifier extends StateNotifier<CategoryState> {
  final GetCategoriesUseCase getCategoriesUseCase;

  CategoryNotifier({required this.getCategoriesUseCase})
      : super(const CategoryState());

  Future<void> loadCategories() async {
    state = state.copyWith(status: CategoryStatus.loading);

    try {
      final categories = await getCategoriesUseCase();
      state = state.copyWith(
        status: CategoryStatus.success,
        categories: categories,
      );
    } catch (error) {
      state = state.copyWith(
        status: CategoryStatus.failure,
        errorMessage: error.toString(),
      );
    }
  }
}