class LoginRequestModel {
  final String phone;

  LoginRequestModel({
    required this.phone,
  });

  Map<String, dynamic> toJson() {
    return {
      'phone': phone,
    };
  }

  factory LoginRequestModel.fromJson(Map<String, dynamic> json) {
    return LoginRequestModel(
      phone: json['phone'] ?? '',
    );
  }

  @override
  String toString() {
    return 'LoginRequestModel(phone: $phone)';
  }
}
