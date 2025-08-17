// CreateAccountDatasource

class RegisterResponse {
  final bool isSuccess;
  final List<String> messages;
  final int errorCode;
  final int response;
  final String? accessToken;

  RegisterResponse({
    required this.isSuccess,
    required this.messages,
    required this.errorCode,
    required this.response,
    required this.accessToken,
  });

  factory RegisterResponse.fromJson(
      Map<String, dynamic> json, String? accessToken) {
    return RegisterResponse(
      isSuccess: json['IsSuccess'] ?? false,
      messages: List<String>.from(json['Messages'] ?? []),
      errorCode: json['ErrorCode'] ?? 0,
      response: json['Response'] ?? 0,
      accessToken: accessToken ?? '',
    );
  }

  @override
  String toString() {
    return 'RegisterResponse(isSuccess: $isSuccess, messages: $messages, errorCode: $errorCode, response: $response)';
  }
}
