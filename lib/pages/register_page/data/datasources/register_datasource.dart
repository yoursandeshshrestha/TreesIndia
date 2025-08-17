import 'package:dio/dio.dart';
import 'package:trees_india/commons/constants/api_endpoints.dart';
import 'package:trees_india/commons/constants/enums.dart';
import 'package:trees_india/commons/utils/error_handler.dart';
import 'package:trees_india/commons/utils/services/dio_client.dart';
import 'package:trees_india/pages/register_page/domain/entities/register_response.dart';

class RegisterDatasource {
  final DioClient _dioClient;
  final ErrorHandler _errorHandler;

  RegisterDatasource(
    this._dioClient,
    this._errorHandler,
  );

  Future<RegisterResponse> createAccountWithEmailAndPassword(
      String name, String email, String password, String dataRegion) async {
    try {
      final url = ApiEndpoints.signUp.path;
      final response = await _dioClient.dio.post(
        url,
        data: {
          'Name': name,
          "Password": password,
          "EmailId": email,
        },
      );

      return RegisterResponse.fromJson(response.data, null);
    } on DioException catch (e) {
      String errorMessage = _errorHandler.handleNetworkError(e);
      throw CustomException(
        message: errorMessage,
        type: e.type == DioExceptionType.connectionTimeout ||
                e.type == DioExceptionType.sendTimeout ||
                e.type == DioExceptionType.receiveTimeout
            ? CustomErrorType.timeout
            : CustomErrorType.network,
      );
    } catch (e) {
      final errorMessage = _errorHandler.handleGenericError(e);
      throw CustomException(
        message: errorMessage,
        type: CustomErrorType.generic,
      );
    }
  }
}
