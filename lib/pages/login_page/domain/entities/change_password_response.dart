class ChangePasswordResponse {
  final bool? isSuccess;
  final List<String>? messages;
  final int? errorCode;
  final bool? response;

  ChangePasswordResponse({
    this.isSuccess = false,
    this.messages = const [],
    this.errorCode = 0,
    this.response = false,
  });

  ChangePasswordResponse copyWith({
    bool? isSuccess,
    List<String>? messages,
    int? errorCode,
    bool? response,
  }) {
    return ChangePasswordResponse(
      isSuccess: isSuccess ?? this.isSuccess,
      messages: messages ?? this.messages,
      errorCode: errorCode ?? this.errorCode,
      response: response ?? this.response,
    );
  }

  @override
  String toString() {
    return 'ChangePasswordResponse(isSuccess: $isSuccess, messages: $messages, errorCode: $errorCode, response: $response)';
  }

  Map<String, dynamic> toJson() {
    return {
      'IsSuccess': isSuccess,
      'Messages': messages,
      'ErrorCode': errorCode,
      'Response': response,
    };
  }

  factory ChangePasswordResponse.fromJson(Map<String, dynamic> json) {
    return ChangePasswordResponse(
      isSuccess: json['IsSuccess'],
      messages: json['Messages'],
      errorCode: json['ErrorCode'],
      response: json['Response'],
    );
  }
}
