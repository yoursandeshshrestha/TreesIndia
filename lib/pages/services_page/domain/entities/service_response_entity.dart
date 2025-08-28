import 'package:equatable/equatable.dart';
import '../../../../commons/domain/entities/pagination_entity.dart';
import 'service_detail_entity.dart';

class ServiceResponseEntity extends Equatable {
  final List<ServiceDetailEntity> services;
  final PaginationEntity pagination;

  const ServiceResponseEntity({
    required this.services,
    required this.pagination,
  });

  @override
  List<Object> get props => [services, pagination];
}
