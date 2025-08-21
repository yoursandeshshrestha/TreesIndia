import 'package:trees_india/commons/utils/error_handler.dart';
import 'package:trees_india/commons/utils/services/dio_client.dart';

class HomePageRemoteDatasource {
  final DioClient _dioClient;
  final ErrorHandler _errorHandler; // Inject ErrorHandler

  HomePageRemoteDatasource(this._dioClient, this._errorHandler);

  // TODO: Implement home page data fetching methods
  // Example:
  // Future<HomePageData> fetchHomePageData() async {
  //   try {
  //     final response = await _dioClient.dio.get('/home');
  //     return HomePageData.fromJson(response.data);
  //   } catch (e) {
  //     throw _errorHandler.handleError(e);
  //   }
  // }
}
