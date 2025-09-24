class AddressEntity {
  final String street;
  final String city;
  final String state;
  final String pincode;
  final String? landmark;

  const AddressEntity({
    required this.street,
    required this.city,
    required this.state,
    required this.pincode,
    this.landmark,
  });

  AddressEntity copyWith({
    String? street,
    String? city,
    String? state,
    String? pincode,
    String? landmark,
  }) {
    return AddressEntity(
      street: street ?? this.street,
      city: city ?? this.city,
      state: state ?? this.state,
      pincode: pincode ?? this.pincode,
      landmark: landmark ?? this.landmark,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'street': street,
      'city': city,
      'state': state,
      'pincode': pincode,
      'landmark': landmark,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is AddressEntity &&
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
    return 'AddressEntity(street: $street, city: $city, state: $state, pincode: $pincode, landmark: $landmark)';
  }
}