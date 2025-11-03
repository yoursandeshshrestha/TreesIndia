import 'package:equatable/equatable.dart';
import '../../../home_page/domain/entities/category_entity.dart';
import '../../../home_page/domain/entities/subcategory_entity.dart';
import '../../../../commons/domain/entities/pagination_entity.dart';
import '../../domain/entities/service_detail_entity.dart';

enum ServiceStatus { initial, loading, success, failure, loadingMore }

class ServiceState extends Equatable {
  final ServiceStatus status;
  final List<ServiceDetailEntity> services;
  final PaginationEntity? pagination;
  final CategoryEntity? currentCategory;
  final SubcategoryEntity? currentSubcategory;
  final int? currentCategoryId;
  final int? currentSubcategoryId;
  final String? userCity;
  final String? userState;
  final bool isLoadingMore;
  final bool hasMoreServices;
  final String errorMessage;

  const ServiceState({
    this.status = ServiceStatus.initial,
    this.services = const [],
    this.pagination,
    this.currentCategory,
    this.currentSubcategory,
    this.currentCategoryId,
    this.currentSubcategoryId,
    this.userCity,
    this.userState,
    this.isLoadingMore = false,
    this.hasMoreServices = false,
    this.errorMessage = '',
  });

  ServiceState copyWith({
    ServiceStatus? status,
    List<ServiceDetailEntity>? services,
    PaginationEntity? pagination,
    CategoryEntity? currentCategory,
    SubcategoryEntity? currentSubcategory,
    int? currentCategoryId,
    int? currentSubcategoryId,
    String? userCity,
    String? userState,
    bool? isLoadingMore,
    bool? hasMoreServices,
    String? errorMessage,
  }) {
    return ServiceState(
      status: status ?? this.status,
      services: services ?? this.services,
      pagination: pagination ?? this.pagination,
      currentCategory: currentCategory ?? this.currentCategory,
      currentSubcategory: currentSubcategory ?? this.currentSubcategory,
      currentCategoryId: currentCategoryId ?? this.currentCategoryId,
      currentSubcategoryId: currentSubcategoryId ?? this.currentSubcategoryId,
      userCity: userCity ?? this.userCity,
      userState: userState ?? this.userState,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      hasMoreServices: hasMoreServices ?? this.hasMoreServices,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        status,
        services,
        pagination,
        currentCategory,
        currentSubcategory,
        currentCategoryId,
        currentSubcategoryId,
        userCity,
        userState,
        isLoadingMore,
        hasMoreServices,
        errorMessage,
      ];
}
