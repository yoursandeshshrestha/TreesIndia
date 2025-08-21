class TokenEntity {
  final String token;
  final String? userId;

  final String refreshToken;

  TokenEntity({
    required this.token,
    this.userId = '',
    required this.refreshToken,
  });

  // Serialization method
  Map<String, dynamic> toJson() {
    return {
      'token': token,
      'userId': userId,
      'refreshToken': refreshToken,
    };
  }

  // Deserialization method
  factory TokenEntity.fromJson(Map<String, dynamic> json) {
    return TokenEntity(
        token: json['token'],
        userId: json['userId'],
        refreshToken: json['refreshToken']);
  }

  @override
  String toString() {
    return 'TokenEntity(token: $token, userId: $userId,  refreshToken: $refreshToken)';
  }
}
