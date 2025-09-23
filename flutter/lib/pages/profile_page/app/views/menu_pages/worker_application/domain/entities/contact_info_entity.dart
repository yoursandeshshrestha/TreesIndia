class ContactInfoEntity {
  final String fullName;
  final String email;
  final String phone;
  final String alternativePhone;

  const ContactInfoEntity({
    required this.fullName,
    required this.email,
    required this.phone,
    required this.alternativePhone,
  });

  ContactInfoEntity copyWith({
    String? fullName,
    String? email,
    String? phone,
    String? alternativePhone,
  }) {
    return ContactInfoEntity(
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      alternativePhone: alternativePhone ?? this.alternativePhone,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'fullName': fullName,
      'email': email,
      'phone': phone,
      'alternativePhone': alternativePhone,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is ContactInfoEntity &&
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
    return 'ContactInfoEntity(fullName: $fullName, email: $email, phone: $phone, alternativePhone: $alternativePhone)';
  }
}