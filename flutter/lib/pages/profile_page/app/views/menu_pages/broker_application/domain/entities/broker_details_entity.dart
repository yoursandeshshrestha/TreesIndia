class BrokerDetailsEntity {
  final String licenseNumber;
  final String agencyName;

  const BrokerDetailsEntity({
    required this.licenseNumber,
    required this.agencyName,
  });

  BrokerDetailsEntity copyWith({
    String? licenseNumber,
    String? agencyName,
  }) {
    return BrokerDetailsEntity(
      licenseNumber: licenseNumber ?? this.licenseNumber,
      agencyName: agencyName ?? this.agencyName,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'licenseNumber': licenseNumber,
      'agencyName': agencyName,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is BrokerDetailsEntity &&
      other.licenseNumber == licenseNumber &&
      other.agencyName == agencyName;
  }

  @override
  int get hashCode {
    return licenseNumber.hashCode ^ agencyName.hashCode;
  }

  @override
  String toString() {
    return 'BrokerDetailsEntity(licenseNumber: $licenseNumber, agencyName: $agencyName)';
  }
}
