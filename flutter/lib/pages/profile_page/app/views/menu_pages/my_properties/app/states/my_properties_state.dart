import 'package:equatable/equatable.dart';
import '../../domain/entities/property_entity.dart';

enum MyPropertiesStatus { initial, loading, success, failure, deleting }

class MyPropertiesState extends Equatable {
  final MyPropertiesStatus status;
  final List<PropertyEntity> properties;
  final String errorMessage;
  final bool hasMore;
  final int currentPage;
  final int? deletingPropertyId;

  const MyPropertiesState({
    this.status = MyPropertiesStatus.initial,
    this.properties = const [],
    this.errorMessage = '',
    this.hasMore = true,
    this.currentPage = 1,
    this.deletingPropertyId,
  });

  MyPropertiesState copyWith({
    MyPropertiesStatus? status,
    List<PropertyEntity>? properties,
    String? errorMessage,
    bool? hasMore,
    int? currentPage,
    int? deletingPropertyId,
  }) {
    return MyPropertiesState(
      status: status ?? this.status,
      properties: properties ?? this.properties,
      errorMessage: errorMessage ?? this.errorMessage,
      hasMore: hasMore ?? this.hasMore,
      currentPage: currentPage ?? this.currentPage,
      deletingPropertyId: deletingPropertyId ?? this.deletingPropertyId,
    );
  }

  @override
  List<Object?> get props => [
        status,
        properties,
        errorMessage,
        hasMore,
        currentPage,
        deletingPropertyId,
      ];
}