import 'package:trees_india/commons/domain/entities/token_entity.dart';

class TokenModel {
  final String authToken;
  final String refreshToken;

  TokenModel({
    required this.authToken,
    required this.refreshToken,
  });

  // Convert the response JSON to a TokenModel
  factory TokenModel.fromJson(Map<String, dynamic> json) {
    return TokenModel(
        authToken: json['AuthToken'] ?? '',
        refreshToken: json['Refreshtoken'] ?? '');
  }

  // Convert the Model to a Map (for local storage or POST requests)
  Map<String, dynamic> toJson() {
    return {
      'AuthToken': authToken,
      'Refreshtoken': refreshToken,
    };
  }

  // Convert TokenModel to TokenEntity for business logic use
  TokenEntity toEntity({String? userId}) {
    return TokenEntity(
      token: authToken,
      userId: userId,
      refreshToken: refreshToken,
    );
  }

  TokenModel copyWith({
    String? authToken,
    String? refreshToken,
  }) {
    return TokenModel(
      authToken: authToken ?? this.authToken,
      refreshToken: refreshToken ?? this.refreshToken,
    );
  }

  @override
  String toString() {
    return 'TokenModel{authToken: $authToken,  refreshToken: $refreshToken}';
  }
}
