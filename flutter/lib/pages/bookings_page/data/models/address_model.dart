import 'dart:convert';
import '../../domain/entities/address_entity.dart';

class AddressModel extends AddressEntity {
  const AddressModel({
    required super.city,
    required super.name,
    required super.state,
    required super.address,
    required super.country,
    required super.landmark,
    required super.latitude,
    required super.longitude,
    required super.postalCode,
    required super.houseNumber,
  });

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      city: json['city'] as String,
      name: json['name'] as String,
      state: json['state'] as String,
      address: json['address'] as String,
      country: json['country'] as String,
      landmark: json['landmark'] as String? ?? '',
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      postalCode: json['postal_code'] as String,
      houseNumber: json['house_number'] as String? ?? '',
    );
  }

  factory AddressModel.fromJsonString(String jsonString) {
    final json = jsonDecode(jsonString) as Map<String, dynamic>;
    return AddressModel.fromJson(json);
  }

  Map<String, dynamic> toJson() {
    return {
      'city': city,
      'name': name,
      'state': state,
      'address': address,
      'country': country,
      'landmark': landmark,
      'latitude': latitude,
      'longitude': longitude,
      'postal_code': postalCode,
      'house_number': houseNumber,
    };
  }

  AddressEntity toEntity() {
    return AddressEntity(
      city: city,
      name: name,
      state: state,
      address: address,
      country: country,
      landmark: landmark,
      latitude: latitude,
      longitude: longitude,
      postalCode: postalCode,
      houseNumber: houseNumber,
    );
  }

  factory AddressModel.fromEntity(AddressEntity entity) {
    return AddressModel(
      city: entity.city,
      name: entity.name,
      state: entity.state,
      address: entity.address,
      country: entity.country,
      landmark: entity.landmark,
      latitude: entity.latitude,
      longitude: entity.longitude,
      postalCode: entity.postalCode,
      houseNumber: entity.houseNumber,
    );
  }
}