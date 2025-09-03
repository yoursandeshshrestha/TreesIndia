import 'package:trees_india/commons/constants/error_codes.dart';

class TextValidators {
  static List<String> validateEmail(String email) {
    List<String> errorCodes = [];

    if (email.isEmpty) {
      errorCodes.add(ErrorCodes.emailEmpty);
    } else {
      bool emailValid =
          RegExp(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
              .hasMatch(email);

      if (!emailValid) {
        errorCodes.add(ErrorCodes.emailInvalidFormat);
      }
    }

    return errorCodes;
  }

  static List<String> validatePassword(String password) {
    List<String> errorCodes = [];

    if (password.isEmpty) {
      errorCodes.add(ErrorCodes.passwordEmpty);
    } else {
      if (password.length < 8) {
        errorCodes.add(ErrorCodes.passwordTooShort);
      }
      if (!RegExp(r'[A-Z]').hasMatch(password)) {
        errorCodes.add(ErrorCodes.passwordMissingUppercase);
      }
      if (!RegExp(r'[0-9]').hasMatch(password)) {
        errorCodes.add(ErrorCodes.passwordMissingNumber);
      }
    }

    return errorCodes;
  }

  // Similar changes for other validators...
}
