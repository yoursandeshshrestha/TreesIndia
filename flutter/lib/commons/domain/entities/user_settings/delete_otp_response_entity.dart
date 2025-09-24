class DeleteOtpResponseEntity {
  final String message;
  final String phone;

  DeleteOtpResponseEntity({
    required this.message,
    required this.phone,
  });

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is DeleteOtpResponseEntity &&
        other.message == message &&
        other.phone == phone;
  }

  @override
  int get hashCode => message.hashCode ^ phone.hashCode;
}