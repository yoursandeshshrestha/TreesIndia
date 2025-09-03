enum LoginState {
  initial,
  loadingLogin,
  loadingRegister,
  loadingOtpVerification,
  loginSuccess,
  registerSuccess,
  otpSent,
  authenticationSuccess,
  error,
}

class LoginStateModel {
  final LoginState state;
  final String? phoneNumber;
  final String? otp;
  final String? errorMessage;
  final String? successMessage;
  final bool isLoading;

  const LoginStateModel({
    this.state = LoginState.initial,
    this.phoneNumber,
    this.otp,
    this.errorMessage,
    this.successMessage,
    this.isLoading = false,
  });

  LoginStateModel copyWith({
    LoginState? state,
    String? phoneNumber,
    String? otp,
    String? errorMessage,
    String? successMessage,
    bool? isLoading,
  }) {
    return LoginStateModel(
      state: state ?? this.state,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      otp: otp ?? this.otp,
      errorMessage: errorMessage ?? this.errorMessage,
      successMessage: successMessage ?? this.successMessage,
      isLoading: isLoading ?? this.isLoading,
    );
  }

  LoginStateModel clearMessages() {
    return copyWith(
      errorMessage: "",
      successMessage: "",
    );
  }

  @override
  String toString() {
    return 'LoginStateModel(state: $state, phoneNumber: $phoneNumber, isLoading: $isLoading, errorMessage: $errorMessage, successMessage: $successMessage)';
  }
}
