import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/get_subcategories_usecase.dart';
import 'subcategory_state.dart';

class SubcategoryNotifier extends StateNotifier<SubcategoryState> {
  final GetSubcategoriesUseCase getSubcategoriesUseCase;

  SubcategoryNotifier({required this.getSubcategoriesUseCase})
      : super(const SubcategoryState());

  Future<void> loadSubcategoriesByCategory(int categoryId) async {
    state = state.copyWith(
      status: SubcategoryStatus.loading,
      selectedCategoryId: categoryId,
    );

    try {
      final subcategories = await getSubcategoriesUseCase(categoryId);
      state = state.copyWith(
        status: SubcategoryStatus.success,
        subcategories: subcategories,
      );
    } catch (error) {
      state = state.copyWith(
        status: SubcategoryStatus.failure,
        errorMessage: error.toString(),
      );
    }
  }

  void clearSubcategories() {
    state = const SubcategoryState();
  }
}