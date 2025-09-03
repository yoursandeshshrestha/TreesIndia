class RefreshTokenRequestModel {
  final String refreshToken;

  RefreshTokenRequestModel({
    required this.refreshToken,
  });

  Map<String, dynamic> toJson() {
    return {
      'refresh_token': refreshToken,
    };
  }

  factory RefreshTokenRequestModel.fromJson(Map<String, dynamic> json) {
    return RefreshTokenRequestModel(
      refreshToken: json['refresh_token'] ?? '',
    );
  }

  @override
  String toString() {
    return 'RefreshTokenRequestModel(refreshToken: $refreshToken)';
  }
}
