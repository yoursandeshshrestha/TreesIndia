class OtpRequestEntity {
  final String phone;
  final String otp;

  const OtpRequestEntity({
    required this.phone,
    required this.otp,
  });

  OtpRequestEntity copyWith({
    String? phone,
    String? otp,
  }) {
    return OtpRequestEntity(
      phone: phone ?? this.phone,
      otp: otp ?? this.otp,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'phone': phone,
      'otp': otp,
    };
  }

  @override
  String toString() {
    return 'OtpRequestEntity(phone: $phone, otp: $otp)';
  }
}
