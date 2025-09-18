import 'package:dio/dio.dart';
import '../../../../../../../../commons/constants/api_endpoints.dart';
import '../../../../../../../../commons/utils/services/dio_client.dart';
import '../../../../../../../../commons/utils/error_handler.dart';
import '../models/subscription_model.dart';
import '../models/payment_order_model.dart';

class SubscriptionRemoteDataSource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  SubscriptionRemoteDataSource({
    required this.dioClient,
    required this.errorHandler,
  });

  Future<SubscriptionModel?> getMySubscription() async {
    final url = ApiEndpoints.mySubscription.path;

    try {
      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200 && response.data['success'] == true) {
        if (response.data['data'] != null) {
          return SubscriptionModel.fromJson(response.data['data']);
        }
        return null; // No active subscription
      } else {
        throw Exception('Failed to get subscription. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        // Handle 404 gracefully for "No active subscription" case
        if (e.response?.statusCode == 404) {
          final responseData = e.response?.data;
          if (responseData is Map<String, dynamic> &&
              responseData['success'] == false &&
              responseData['message'] == 'No active subscription') {
            return null; // No active subscription - this is a valid state
          }
        }
        throw errorHandler.handleError(e);
      } else {
        throw Exception('Failed to get subscription. Please try again.');
      }
    }
  }

  Future<List<SubscriptionModel>> getSubscriptionHistory() async {
    final url = ApiEndpoints.subscriptionHistory.path;

    try {
      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'] ?? [];
        return data.map((item) => SubscriptionModel.fromJson(item)).toList();
      } else {
        throw Exception('Failed to get subscription history. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        throw errorHandler.handleError(e);
      } else {
        throw Exception('Failed to get subscription history. Please try again.');
      }
    }
  }

  Future<List<SubscriptionPlanModel>> getSubscriptionPlans() async {
    final url = ApiEndpoints.subscriptionPlans.path;

    try {
      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'] ?? [];
        return data.map((item) => SubscriptionPlanModel.fromJson(item)).toList();
      } else {
        throw Exception('Failed to get subscription plans. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        throw errorHandler.handleError(e);
      } else {
        throw Exception('Failed to get subscription plans. Please try again.');
      }
    }
  }

  Future<PaymentOrderModel> createPaymentOrder(
    SubscriptionPurchaseRequestModel request,
  ) async {
    final url = ApiEndpoints.createPaymentOrder.path;

    try {
      final response = await dioClient.dio.post(
        url,
        data: request.toJson(),
      );

      if ((response.statusCode == 200 || response.statusCode == 201) &&
          response.data['success'] == true) {
        if (response.data['data'] != null) {
          return PaymentOrderModel.fromJson(response.data['data']);
        } else {
          throw Exception('Failed to create payment order. Please try again.');
        }
      } else {
        throw Exception('Failed to create payment order. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        throw errorHandler.handleError(e);
      } else {
        throw Exception('Failed to create payment order. Please try again.');
      }
    }
  }

  Future<SubscriptionModel> completePurchase(
    CompletePurchaseRequestModel request,
  ) async {
    final url = ApiEndpoints.completePurchase.path;

    try {
      final response = await dioClient.dio.post(
        url,
        data: request.toJson(),
      );

      if ((response.statusCode == 200 || response.statusCode == 201) &&
          response.data['success'] == true) {
        if (response.data['data'] != null) {
          return SubscriptionModel.fromJson(response.data['data']);
        } else {
          throw Exception('Failed to complete purchase. Please try again.');
        }
      } else {
        throw Exception('Failed to complete purchase. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        throw errorHandler.handleError(e);
      } else {
        throw Exception('Failed to complete purchase. Please try again.');
      }
    }
  }
}