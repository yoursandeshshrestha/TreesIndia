import 'package:equatable/equatable.dart';
import '../../../../commons/domain/entities/pagination_entity.dart';
import 'booking_details_entity.dart';

class BookingsResponseEntity extends Equatable {
  final List<BookingDetailsEntity> bookings;
  final PaginationEntity pagination;

  const BookingsResponseEntity({
    required this.bookings,
    required this.pagination,
  });

  @override
  List<Object> get props => [bookings, pagination];
}