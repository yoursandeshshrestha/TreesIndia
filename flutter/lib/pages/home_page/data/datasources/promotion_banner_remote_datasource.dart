import 'package:dio/dio.dart';
import '../../../../commons/constants/api_endpoints.dart';
import '../../../../commons/utils/error_handler.dart';
import '../../../../commons/utils/services/dio_client.dart';
import '../models/promotion_banner_model.dart';

abstract class PromotionBannerRemoteDataSource {
  Future<List<PromotionBannerModel>> getPromotionBanners();
}

class PromotionBannerRemoteDataSourceImpl
    implements PromotionBannerRemoteDataSource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  PromotionBannerRemoteDataSourceImpl({
    required this.dioClient,
    required this.errorHandler,
  });

  @override
  Future<List<PromotionBannerModel>> getPromotionBanners() async {
    try {
      final url = ApiEndpoints.promotionBanners.path;
      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['success'] == true) {
          final bannersJson = data['data'] as List;
          return bannersJson
              .map((json) => PromotionBannerModel.fromJson(json))
              .toList();
        } else {
          throw Exception(data['message'] ?? 'Failed to fetch promotion banners');
        }
      } else {
        throw Exception('Failed to fetch promotion banners. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Could not fetch promotion banners. Please try again.');
    }
  }
}
