class ChangePasswordEntity {
  final String emailId;
  final String currentPassword;
  final String newPassword;
  final String confirmPassword;

  ChangePasswordEntity({
    this.emailId = '',
    this.currentPassword = '',
    this.newPassword = '',
    this.confirmPassword = '',
  });

  ChangePasswordEntity copyWith({
    String? emailId,
    String? currentPassword,
    String? newPassword,
    String? confirmPassword,
  }) {
    return ChangePasswordEntity(
      emailId: emailId ?? this.emailId,
      currentPassword: currentPassword ?? this.currentPassword,
      newPassword: newPassword ?? this.newPassword,
      confirmPassword: confirmPassword ?? this.confirmPassword,
    );
  }

  @override
  String toString() {
    return 'ChangePasswordEntity(emailId: $emailId, currentPassword: $currentPassword, newPassword: $newPassword, confirmPassword: $confirmPassword)';
  }

  Map<String, dynamic> toJson() {
    return {
      'emailId': emailId,
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    };
  }

  factory ChangePasswordEntity.fromJson(Map<String, dynamic> json) {
    return ChangePasswordEntity(
      emailId: json['emailId'],
      currentPassword: json['currentPassword'],
      newPassword: json['newPassword'],
    );
  }
}
