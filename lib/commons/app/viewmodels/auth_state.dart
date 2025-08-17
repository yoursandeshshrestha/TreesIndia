enum AuthFlowState {
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

class AuthFlowStateModel {
  final AuthFlowState state;
  final String? phoneNumber;
  final String? otp;
  final String? errorMessage;
  final String? successMessage;
  final bool isLoading;

  const AuthFlowStateModel({
    this.state = AuthFlowState.initial,
    this.phoneNumber,
    this.otp,
    this.errorMessage,
    this.successMessage,
    this.isLoading = false,
  });

  AuthFlowStateModel copyWith({
    AuthFlowState? state,
    String? phoneNumber,
    String? otp,
    String? errorMessage,
    String? successMessage,
    bool? isLoading,
  }) {
    return AuthFlowStateModel(
      state: state ?? this.state,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      otp: otp ?? this.otp,
      errorMessage: errorMessage ?? this.errorMessage,
      successMessage: successMessage ?? this.successMessage,
      isLoading: isLoading ?? this.isLoading,
    );
  }

  AuthFlowStateModel clearMessages() {
    return copyWith(
      errorMessage: "",
      successMessage: "",
    );
  }

  @override
  String toString() {
    return 'AuthFlowStateModel(state: $state, phoneNumber: $phoneNumber, isLoading: $isLoading, errorMessage: $errorMessage, successMessage: $successMessage)';
  }
}
