class LoginRequestEntity {
  final String phone;

  const LoginRequestEntity({
    required this.phone,
  });

  LoginRequestEntity copyWith({
    String? phone,
  }) {
    return LoginRequestEntity(
      phone: phone ?? this.phone,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'phone': phone,
    };
  }

  @override
  String toString() {
    return 'LoginRequestEntity(phone: $phone)';
  }
}
