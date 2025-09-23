import '../../domain/entities/address_entity.dart';

class AddressModel {
  final String street;
  final String city;
  final String state;
  final String pincode;
  final String? landmark;

  const AddressModel({
    required this.street,
    required this.city,
    required this.state,
    required this.pincode,
    this.landmark,
  });

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      street: json['street'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      pincode: json['pincode'] ?? '',
      landmark: json['landmark'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'street': street,
      'city': city,
      'state': state,
      'pincode': pincode,
      'landmark': landmark,
    };
  }

  AddressEntity toEntity() {
    return AddressEntity(
      street: street,
      city: city,
      state: state,
      pincode: pincode,
      landmark: landmark,
    );
  }

  factory AddressModel.fromEntity(AddressEntity entity) {
    return AddressModel(
      street: entity.street,
      city: entity.city,
      state: entity.state,
      pincode: entity.pincode,
      landmark: entity.landmark,
    );
  }

  AddressModel copyWith({
    String? street,
    String? city,
    String? state,
    String? pincode,
    String? landmark,
  }) {
    return AddressModel(
      street: street ?? this.street,
      city: city ?? this.city,
      state: state ?? this.state,
      pincode: pincode ?? this.pincode,
      landmark: landmark ?? this.landmark,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is AddressModel &&
      other.street == street &&
      other.city == city &&
      other.state == state &&
      other.pincode == pincode &&
      other.landmark == landmark;
  }

  @override
  int get hashCode {
    return street.hashCode ^
      city.hashCode ^
      state.hashCode ^
      pincode.hashCode ^
      landmark.hashCode;
  }

  @override
  String toString() {
    return 'AddressModel(street: $street, city: $city, state: $state, pincode: $pincode, landmark: $landmark)';
  }
}