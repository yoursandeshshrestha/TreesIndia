import 'package:equatable/equatable.dart';

class AddressEntity extends Equatable {
  final String city;
  final String name;
  final String state;
  final String address;
  final String country;
  final String landmark;
  final double latitude;
  final double longitude;
  final String postalCode;
  final String houseNumber;

  const AddressEntity({
    required this.city,
    required this.name,
    required this.state,
    required this.address,
    required this.country,
    required this.landmark,
    required this.latitude,
    required this.longitude,
    required this.postalCode,
    required this.houseNumber,
  });

  @override
  List<Object> get props => [
        city,
        name,
        state,
        address,
        country,
        landmark,
        latitude,
        longitude,
        postalCode,
        houseNumber,
      ];
}