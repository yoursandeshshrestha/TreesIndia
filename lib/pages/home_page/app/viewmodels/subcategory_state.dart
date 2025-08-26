import 'package:equatable/equatable.dart';
import '../../domain/entities/subcategory_entity.dart';

enum SubcategoryStatus { initial, loading, success, failure }

class SubcategoryState extends Equatable {
  final SubcategoryStatus status;
  final List<SubcategoryEntity> subcategories;
  final int? selectedCategoryId;
  final String errorMessage;

  const SubcategoryState({
    this.status = SubcategoryStatus.initial,
    this.subcategories = const [],
    this.selectedCategoryId,
    this.errorMessage = '',
  });

  SubcategoryState copyWith({
    SubcategoryStatus? status,
    List<SubcategoryEntity>? subcategories,
    int? selectedCategoryId,
    String? errorMessage,
  }) {
    return SubcategoryState(
      status: status ?? this.status,
      subcategories: subcategories ?? this.subcategories,
      selectedCategoryId: selectedCategoryId ?? this.selectedCategoryId,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, subcategories, selectedCategoryId, errorMessage];
}