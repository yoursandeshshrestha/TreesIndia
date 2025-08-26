import 'package:equatable/equatable.dart';

class PaginationEntity extends Equatable {
  final bool hasNext;
  final bool hasPrev;
  final int limit;
  final int page;
  final int total;
  final int totalPages;

  const PaginationEntity({
    required this.hasNext,
    required this.hasPrev,
    required this.limit,
    required this.page,
    required this.total,
    required this.totalPages,
  });

  @override
  List<Object> get props => [
        hasNext,
        hasPrev,
        limit,
        page,
        total,
        totalPages,
      ];
}