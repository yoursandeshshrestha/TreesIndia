import 'package:equatable/equatable.dart';

class BookingAddressEntity extends Equatable {
  final String name;
  final String address;
  final String city;
  final String state;
  final String country;
  final String postalCode;
  final double latitude;
  final double longitude;

  const BookingAddressEntity({
    required this.name,
    required this.address,
    required this.city,
    required this.state,
    required this.country,
    required this.postalCode,
    required this.latitude,
    required this.longitude,
  });

  @override
  List<Object?> get props => [
        name,
        address,
        city,
        state,
        country,
        postalCode,
        latitude,
        longitude,
      ];
}