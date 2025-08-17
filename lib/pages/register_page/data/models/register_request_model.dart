class RegisterRequestModel {
  final String phone;

  RegisterRequestModel({
    required this.phone,
  });

  Map<String, dynamic> toJson() {
    return {
      'phone': phone,
    };
  }

  factory RegisterRequestModel.fromJson(Map<String, dynamic> json) {
    return RegisterRequestModel(
      phone: json['phone'] ?? '',
    );
  }

  @override
  String toString() {
    return 'RegisterRequestModel(phone: $phone)';
  }
}
