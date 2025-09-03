import 'package:trees_india/commons/data/models/token_model.dart';

class LoginResponse {
  bool isSuccess;
  List<String> messages;
  int errorCode;
  TokenModel response;
  String? googleAccessToken;
  String? microsoftAccessToken;

  LoginResponse({
    required this.isSuccess,
    required this.messages,
    required this.response,
    required this.errorCode,
    this.googleAccessToken,
    this.microsoftAccessToken,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json,
      String? googleAccessToken, String? microsoftAccessToken) {
    return LoginResponse(
        isSuccess: json['IsSuccess'] as bool? ?? false,
        response: TokenModel.fromJson(Map<String, dynamic>.from(
            json['Response'] as Map<String, dynamic>? ?? {})),
        messages: (json['Messages'] as List<dynamic>?)
                ?.map((m) => m.toString())
                .toList() ??
            [],
        errorCode: json['ErrorCode'] as int? ?? 0,
        googleAccessToken: googleAccessToken,
        microsoftAccessToken: microsoftAccessToken);
  }

  @override
  String toString() {
    return 'LoginResponse{isSuccess: $isSuccess, messages: $messages, response: $response, errorCode: $errorCode}';
  }
}
