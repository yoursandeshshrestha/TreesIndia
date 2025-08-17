class RegisterRequestEntity {
  final String phone;

  const RegisterRequestEntity({
    required this.phone,
  });

  RegisterRequestEntity copyWith({
    String? phone,
  }) {
    return RegisterRequestEntity(
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
    return 'RegisterRequestEntity(phone: $phone)';
  }
}
