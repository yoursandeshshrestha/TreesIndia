import '../../domain/entities/contact_info_entity.dart';

class ContactInfoModel {
  final String fullName;
  final String email;
  final String phone;
  final String alternativePhone;

  const ContactInfoModel({
    required this.fullName,
    required this.email,
    required this.phone,
    required this.alternativePhone,
  });

  factory ContactInfoModel.fromJson(Map<String, dynamic> json) {
    return ContactInfoModel(
      fullName: json['fullName'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      alternativePhone: json['alternativePhone'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'fullName': fullName,
      'email': email,
      'phone': phone,
      'alternativePhone': alternativePhone,
    };
  }

  ContactInfoEntity toEntity() {
    return ContactInfoEntity(
      fullName: fullName,
      email: email,
      phone: phone,
      alternativePhone: alternativePhone,
    );
  }

  factory ContactInfoModel.fromEntity(ContactInfoEntity entity) {
    return ContactInfoModel(
      fullName: entity.fullName,
      email: entity.email,
      phone: entity.phone,
      alternativePhone: entity.alternativePhone,
    );
  }

  ContactInfoModel copyWith({
    String? fullName,
    String? email,
    String? phone,
    String? alternativePhone,
  }) {
    return ContactInfoModel(
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      alternativePhone: alternativePhone ?? this.alternativePhone,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is ContactInfoModel &&
      other.fullName == fullName &&
      other.email == email &&
      other.phone == phone &&
      other.alternativePhone == alternativePhone;
  }

  @override
  int get hashCode {
    return fullName.hashCode ^
      email.hashCode ^
      phone.hashCode ^
      alternativePhone.hashCode;
  }

  @override
  String toString() {
    return 'ContactInfoModel(fullName: $fullName, email: $email, phone: $phone, alternativePhone: $alternativePhone)';
  }
}