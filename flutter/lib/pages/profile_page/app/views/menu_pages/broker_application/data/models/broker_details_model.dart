import '../../domain/entities/broker_details_entity.dart';

class BrokerDetailsModel {
  final String licenseNumber;
  final String agencyName;

  const BrokerDetailsModel({
    required this.licenseNumber,
    required this.agencyName,
  });

  factory BrokerDetailsModel.fromJson(Map<String, dynamic> json) {
    return BrokerDetailsModel(
      licenseNumber: json['license'] ?? '',
      agencyName: json['agency'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'license': licenseNumber,
      'agency': agencyName,
    };
  }

  BrokerDetailsEntity toEntity() {
    return BrokerDetailsEntity(
      licenseNumber: licenseNumber,
      agencyName: agencyName,
    );
  }

  factory BrokerDetailsModel.fromEntity(BrokerDetailsEntity entity) {
    return BrokerDetailsModel(
      licenseNumber: entity.licenseNumber,
      agencyName: entity.agencyName,
    );
  }

  BrokerDetailsModel copyWith({
    String? licenseNumber,
    String? agencyName,
  }) {
    return BrokerDetailsModel(
      licenseNumber: licenseNumber ?? this.licenseNumber,
      agencyName: agencyName ?? this.agencyName,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is BrokerDetailsModel &&
      other.licenseNumber == licenseNumber &&
      other.agencyName == agencyName;
  }

  @override
  int get hashCode {
    return licenseNumber.hashCode ^ agencyName.hashCode;
  }

  @override
  String toString() {
    return 'BrokerDetailsModel(licenseNumber: $licenseNumber, agencyName: $agencyName)';
  }
}
