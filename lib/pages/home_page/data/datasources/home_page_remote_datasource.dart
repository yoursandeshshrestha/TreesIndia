import 'package:trees_india/commons/utils/error_handler.dart';
import 'package:trees_india/commons/utils/services/dio_client.dart';

class HomePageRemoteDatasource {
  final DioClient _dioClient;
  final ErrorHandler _errorHandler; // Inject ErrorHandler

  HomePageRemoteDatasource(this._dioClient, this._errorHandler);
}
