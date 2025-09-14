import '../../../../commons/data/models/pagination_model.dart';
import '../../domain/entities/bookings_response_entity.dart';
import 'booking_details_model.dart';

class BookingsResponseModel extends BookingsResponseEntity {
  const BookingsResponseModel({
    required super.bookings,
    required super.pagination,
  });

  factory BookingsResponseModel.fromJson(Map<String, dynamic> json) {
    final paginationData = json['pagination'] as Map<String, dynamic>? ?? {};

    return BookingsResponseModel(
      bookings: (json['bookings'] as List<dynamic>?)
              ?.map((bookingItem) {
                // Handle both development (wrapped in 'booking' key) and production (direct object) formats
                Map<String, dynamic> bookingData;
                
                if (bookingItem is Map<String, dynamic>) {
                  // Check if this is wrapped format (development)
                  if (bookingItem.containsKey('booking') && bookingItem['booking'] != null) {
                    bookingData = bookingItem['booking'] as Map<String, dynamic>;
                  } else {
                    // Direct format (production)
                    bookingData = bookingItem;
                  }
                } else {
                  throw Exception('Invalid booking data format');
                }
                
                return BookingDetailsModel.fromJson(bookingData);
              })
              .toList() ??
          [],
      pagination: PaginationModel(
        page: paginationData['page'] as int? ?? 1,
        limit: paginationData['limit'] as int? ?? 10,
        total: paginationData['total'] as int? ?? 0,
        totalPages: paginationData['total_pages'] as int? ?? 1,
        hasNext: (paginationData['page'] as int? ?? 1) <
            (paginationData['total_pages'] as int? ?? 1),
        hasPrev: (paginationData['page'] as int? ?? 1) > 1,
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
