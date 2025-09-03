class RefreshTokenRequestEntity {
  final String refreshToken;

  const RefreshTokenRequestEntity({
    required this.refreshToken,
  });

  RefreshTokenRequestEntity copyWith({
    String? refreshToken,
  }) {
    return RefreshTokenRequestEntity(
      refreshToken: refreshToken ?? this.refreshToken,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'refresh_token': refreshToken,
    };
  }

  @override
  String toString() {
    return 'RefreshTokenRequestEntity(refreshToken: $refreshToken)';
  }
}
