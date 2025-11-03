import '../../domain/entities/address_entity.dart';

class AddressModel {
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
  final String createdAt;
  final String updatedAt;

  const AddressModel({
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

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      id: json['id'] as int,
      userId: json['user_id'] as int,
      name: json['name'] as String,
      address: json['address'] as String,
      city: json['city'] as String,
      state: json['state'] as String,
      country: json['country'] as String,
      postalCode: json['postal_code'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      landmark: json['landmark'] as String?,
      houseNumber: json['house_number'] as String?,
      isDefault: json['is_default'] as bool? ?? false,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      'address': address,
      'city': city,
      'state': state,
      'country': country,
      'postal_code': postalCode,
      'latitude': latitude,
      'longitude': longitude,
      'landmark': landmark,
      'house_number': houseNumber,
      'is_default': isDefault,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }

  AddressEntity toEntity() {
    return AddressEntity(
      id: id,
      userId: userId,
      name: name,
      address: address,
      city: city,
      state: state,
      country: country,
      postalCode: postalCode,
      latitude: latitude,
      longitude: longitude,
      landmark: landmark,
      houseNumber: houseNumber,
      isDefault: isDefault,
      createdAt: DateTime.parse(createdAt),
      updatedAt: DateTime.parse(updatedAt),
    );
  }
}

class CreateAddressRequestModel {
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

  const CreateAddressRequestModel({
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

  factory CreateAddressRequestModel.fromEntity(
      CreateAddressRequestEntity entity) {
    return CreateAddressRequestModel(
      name: entity.name,
      address: entity.address,
      city: entity.city,
      state: entity.state,
      country: entity.country,
      postalCode: entity.postalCode,
      latitude: entity.latitude,
      longitude: entity.longitude,
      landmark: entity.landmark,
      houseNumber: entity.houseNumber,
      isDefault: entity.isDefault,
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
      'landmark': landmark,
      'house_number': houseNumber,
      'is_default': isDefault,
    };
  }
}

class UpdateAddressRequestModel {
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

  const UpdateAddressRequestModel({
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

  factory UpdateAddressRequestModel.fromEntity(
      UpdateAddressRequestEntity entity) {
    return UpdateAddressRequestModel(
      id: entity.id,
      name: entity.name,
      address: entity.address,
      city: entity.city,
      state: entity.state,
      country: entity.country,
      postalCode: entity.postalCode,
      latitude: entity.latitude,
      longitude: entity.longitude,
      landmark: entity.landmark,
      houseNumber: entity.houseNumber,
      isDefault: entity.isDefault,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'city': city,
      'state': state,
      'country': country,
      'postal_code': postalCode,
      'latitude': latitude,
      'longitude': longitude,
      'landmark': landmark,
      'house_number': houseNumber,
      'is_default': isDefault,
    };
  }
}

class AddressListResponseModel {
  final List<AddressModel> addresses;
  final String message;

  const AddressListResponseModel({
    required this.addresses,
    required this.message,
  });

  factory AddressListResponseModel.fromJson(Map<String, dynamic> json) {
    return AddressListResponseModel(
      addresses: (json['data'] as List<dynamic>?)
              ?.map((address) =>
                  AddressModel.fromJson(address as Map<String, dynamic>))
              .toList() ??
          [],
      message: json['message'] as String? ?? '',
    );
  }

  AddressListResponseEntity toEntity() {
    return AddressListResponseEntity(
      addresses: addresses.map((model) => model.toEntity()).toList(),
      message: message,
    );
  }
}
