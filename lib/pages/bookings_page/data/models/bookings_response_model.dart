import '../../../../commons/data/models/pagination_model.dart';
import '../../domain/entities/bookings_response_entity.dart';
import 'booking_details_model.dart';

class BookingsResponseModel extends BookingsResponseEntity {
  const BookingsResponseModel({
    required super.bookings,
    required super.pagination,
  });

  factory BookingsResponseModel.fromJson(Map<String, dynamic> json) {
    final paginationData = json['pagination'] as Map<String, dynamic>;

    return BookingsResponseModel(
      bookings: (json['bookings'] as List<dynamic>)
          .map((booking) =>
              BookingDetailsModel.fromJson(booking as Map<String, dynamic>))
          .toList(),
      pagination: PaginationModel(
        page: paginationData['page'] as int,
        limit: paginationData['limit'] as int,
        total: paginationData['total'] as int,
        totalPages: paginationData['total_pages'] as int,
        hasNext: (paginationData['page'] as int) <
            (paginationData['total_pages'] as int),
        hasPrev: (paginationData['page'] as int) > 1,
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'bookings': bookings
          .map((booking) => (booking as BookingDetailsModel).toJson())
          .toList(),
      'pagination': (pagination as PaginationModel).toJson(),
    };
  }

  BookingsResponseEntity toEntity() {
    return BookingsResponseEntity(
      bookings: bookings
          .map((booking) => (booking as BookingDetailsModel).toEntity())
          .toList(),
      pagination: (pagination as PaginationModel).toEntity(),
    );
  }

  factory BookingsResponseModel.fromEntity(BookingsResponseEntity entity) {
    return BookingsResponseModel(
      bookings: entity.bookings
          .map((booking) => BookingDetailsModel.fromEntity(booking))
          .toList(),
      pagination: PaginationModel.fromEntity(entity.pagination),
    );
  }
}
