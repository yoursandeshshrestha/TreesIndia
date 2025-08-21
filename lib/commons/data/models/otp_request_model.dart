class OtpRequestModel {
  final String phone;
  final String otp;

  OtpRequestModel({
    required this.phone,
    required this.otp,
  });

  Map<String, dynamic> toJson() {
    return {
      'phone': phone,
      'otp': otp,
    };
  }

  factory OtpRequestModel.fromJson(Map<String, dynamic> json) {
    return OtpRequestModel(
      phone: json['phone'] ?? '',
      otp: json['otp'] ?? '',
    );
  }

  @override
  String toString() {
    return 'OtpRequestModel(phone: $phone, otp: $otp)';
  }
}
