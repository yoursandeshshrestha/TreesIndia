class ProfileUpdateRequestEntity {
  final String name;
  final String email;
  final String gender;

  const ProfileUpdateRequestEntity({
    required this.name,
    required this.email,
    required this.gender,
  });

  ProfileUpdateRequestEntity copyWith({
    String? name,
    String? email,
    String? gender,
  }) {
    return ProfileUpdateRequestEntity(
      name: name ?? this.name,
      email: email ?? this.email,
      gender: gender ?? this.gender,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'gender': gender,
    };
  }

  @override
  String toString() {
    return 'ProfileUpdateRequestEntity(name: $name, email: $email, gender: $gender)';
  }
}

class ProfileUpdateResponseEntity {
  final bool success;
  final String message;
  final ProfileUpdateDataEntity? data;
  final String timestamp;

  const ProfileUpdateResponseEntity({
    required this.success,
    required this.message,
    this.data,
    required this.timestamp,
  });

  ProfileUpdateResponseEntity copyWith({
    bool? success,
    String? message,
    ProfileUpdateDataEntity? data,
    String? timestamp,
  }) {
    return ProfileUpdateResponseEntity(
      success: success ?? this.success,
      message: message ?? this.message,
      data: data ?? this.data,
      timestamp: timestamp ?? this.timestamp,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': data?.toJson(),
      'timestamp': timestamp,
    };
  }

  @override
  String toString() {
    return 'ProfileUpdateResponseEntity(success: $success, message: $message, data: $data)';
  }
}

class ProfileUpdateDataEntity {
  final String email;
  final String gender;
  final String name;

  const ProfileUpdateDataEntity({
    required this.email,
    required this.gender,
    required this.name,
  });

  ProfileUpdateDataEntity copyWith({
    String? email,
    String? gender,
    String? name,
  }) {
    return ProfileUpdateDataEntity(
      email: email ?? this.email,
      gender: gender ?? this.gender,
      name: name ?? this.name,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'gender': gender,
      'name': name,
    };
  }

  @override
  String toString() {
    return 'ProfileUpdateDataEntity(email: $email, gender: $gender, name: $name)';
  }
}
