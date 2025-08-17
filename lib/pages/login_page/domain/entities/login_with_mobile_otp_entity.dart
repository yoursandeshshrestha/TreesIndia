class LoginWithMobileOTPEntity {
  final bool isSuccess;
  final List<String> messages;
  final int errorCode;
  final int response;

  LoginWithMobileOTPEntity({
    this.isSuccess = false,
    this.messages = const[],
    this.errorCode =0,
    this.response = 0,
  });
  LoginWithMobileOTPEntity copyWith({
    bool? isSuccess,
    List<String>? messages,
    int? errorCode,
    int? response,
  }) {
    return LoginWithMobileOTPEntity(
      isSuccess: isSuccess ?? this.isSuccess,
      messages: messages ?? this.messages,
      errorCode: errorCode ?? this.errorCode,
      response: response ?? this.response,
    );
  }
  @override
  String toString() {
    return 'LoginWithMobileOTPEntity(isSuccess: $isSuccess, messages: $messages, errorCode: $errorCode, response: $response)';
  }
}