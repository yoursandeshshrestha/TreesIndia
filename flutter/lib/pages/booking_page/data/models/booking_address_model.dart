import '../../domain/entities/booking_address_entity.dart';

class BookingAddressModel extends BookingAddressEntity {
  const BookingAddressModel({
    required super.name,
    required super.address,
    required super.city,
    required super.state,
    required super.country,
    required super.postalCode,
    required super.latitude,
    required super.longitude,
  });

  factory BookingAddressModel.fromJson(Map<String, dynamic> json) {
    return BookingAddressModel(
      name: json['name'] as String? ?? '',
      address: json['address'] as String? ?? '',
      city: json['city'] as String? ?? '',
      state: json['state'] as String? ?? '',
      country: json['country'] as String? ?? '',
      postalCode: json['postal_code'] as String? ?? '',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'address': address,
      'city': city,
      'state': state,
      'country': country,
      'postal_code': postalCode,
      'latitude': latitude,
      'longitude': longitude,
      'landmark': '', // Optional field, default to empty string
      'house_number': '', // Optional field, default to empty string
    };
  }

  BookingAddressEntity toEntity() {
    return BookingAddressEntity(
      name: name,
      address: address,
      city: city,
      state: state,
      country: country,
      postalCode: postalCode,
      latitude: latitude,
      longitude: longitude,
    );
  }

  factory BookingAddressModel.fromEntity(BookingAddressEntity entity) {
    return BookingAddressModel(
      name: entity.name,
      address: entity.address,
      city: entity.city,
      state: entity.state,
      country: entity.country,
      postalCode: entity.postalCode,
      latitude: entity.latitude,
      longitude: entity.longitude,
    );
  }
}