import 'package:equatable/equatable.dart';

class AddressEntity extends Equatable {
  final int id;
  final int userId;
  final String name;
  final String address;
  final String city;
  final String state;
  final String country;
  final String postalCode;
  final double latitude;
  final double longitude;
  final String? landmark;
  final String? houseNumber;
  final bool isDefault;
  final DateTime createdAt;
  final DateTime updatedAt;

  const AddressEntity({
    required this.id,
    required this.userId,
    required this.name,
    required this.address,
    required this.city,
    required this.state,
    required this.country,
    required this.postalCode,
    required this.latitude,
    required this.longitude,
    required this.isDefault,
    required this.createdAt,
    required this.updatedAt,
    this.landmark,
    this.houseNumber,
  });

  @override
  List<Object?> get props => [
        id,
        userId,
        name,
        address,
        city,
        state,
        country,
        postalCode,
        latitude,
        longitude,
        landmark,
        houseNumber,
        isDefault,
        createdAt,
        updatedAt,
      ];

  AddressEntity copyWith({
    int? id,
    int? userId,
    String? name,
    String? address,
    String? city,
    String? state,
    String? country,
    String? postalCode,
    double? latitude,
    double? longitude,
    String? landmark,
    String? houseNumber,
    bool? isDefault,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return AddressEntity(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      name: name ?? this.name,
      address: address ?? this.address,
      city: city ?? this.city,
      state: state ?? this.state,
      country: country ?? this.country,
      postalCode: postalCode ?? this.postalCode,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      landmark: landmark ?? this.landmark,
      houseNumber: houseNumber ?? this.houseNumber,
      isDefault: isDefault ?? this.isDefault,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  String get fullAddress {
    final parts = <String>[];
    if (houseNumber?.isNotEmpty == true) parts.add(houseNumber!);
    parts.add(address);
    if (landmark?.isNotEmpty == true) parts.add('Near ${landmark!}');
    parts.add('$city, $state');
    parts.add(postalCode);
    return parts.join(', ');
  }
}

class CreateAddressRequestEntity extends Equatable {
  final String? name;
  final String address;
  final String city;
  final String state;
  final String country;
  final String postalCode;
  final double latitude;
  final double longitude;
  final String? landmark;
  final String? houseNumber;
  final bool isDefault;

  const CreateAddressRequestEntity({
    this.name,
    required this.address,
    required this.city,
    required this.state,
    required this.country,
    required this.postalCode,
    required this.latitude,
    required this.longitude,
    this.landmark,
    this.houseNumber,
    this.isDefault = false,
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
        landmark,
        houseNumber,
        isDefault,
      ];
}

class UpdateAddressRequestEntity extends Equatable {
  final int id;
  final String? name;
  final String address;
  final String city;
  final String state;
  final String country;
  final String postalCode;
  final double latitude;
  final double longitude;
  final String? landmark;
  final String? houseNumber;
  final bool isDefault;

  const UpdateAddressRequestEntity({
    required this.id,
    this.name,
    required this.address,
    required this.city,
    required this.state,
    required this.country,
    required this.postalCode,
    required this.latitude,
    required this.longitude,
    this.landmark,
    this.houseNumber,
    this.isDefault = false,
  });

  @override
  List<Object?> get props => [
        id,
        name,
        address,
        city,
        state,
        country,
        postalCode,
        latitude,
        longitude,
        landmark,
        houseNumber,
        isDefault,
      ];
}

class AddressListResponseEntity extends Equatable {
  final List<AddressEntity> addresses;
  final String message;

  const AddressListResponseEntity({
    required this.addresses,
    required this.message,
  });

  @override
  List<Object?> get props => [addresses, message];
}