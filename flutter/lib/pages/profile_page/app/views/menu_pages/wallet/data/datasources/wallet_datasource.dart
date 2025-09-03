import 'package:dio/dio.dart';
import '../../../../../../../../commons/constants/api_endpoints.dart';
import '../../../../../../../../commons/utils/services/dio_client.dart';
import '../../../../../../../../commons/utils/error_handler.dart';
import '../models/wallet_summary_model.dart';
import '../models/wallet_transactions_response_model.dart';
import '../models/wallet_recharge_model.dart';

class WalletDatasource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  WalletDatasource({
    required this.dioClient,
    required this.errorHandler,
  });

  Future<WalletSummaryModel> getWalletSummary() async {
    final url = ApiEndpoints.walletSummary.path;

    try {
      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200 && response.data['success'] == true) {
        return WalletSummaryModel.fromJson(response.data['data']);
      } else {
        throw Exception('Failed to get wallet summary. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error getting wallet summary.');
    }
  }

  Future<WalletTransactionsResponseModel> getWalletTransactions({
    int page = 1,
    int limit = 10,
  }) async {
    final url = ApiEndpoints.walletTransactions.path;

    try {
      final response = await dioClient.dio.get(
        url,
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return WalletTransactionsResponseModel.fromJson(response.data['data']);
      } else {
        throw Exception('Failed to get wallet transactions. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error getting wallet transactions.');
    }
  }

  Future<WalletTransactionsResponseModel> getTransactionsByType({
    required String type,
    int page = 1,
    int limit = 10,
  }) async {
    final url =
        ApiEndpoints.walletTransactionsByType.path.replaceAll('{type}', type);

    try {
      final response = await dioClient.dio.get(
        url,
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return WalletTransactionsResponseModel.fromJson(response.data['data']);
      } else {
        throw Exception(
            'Failed to get transactions by type. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error getting transactions by type.');
    }
  }

  Future<WalletRechargeResponseModel> initiateWalletRecharge({
    required WalletRechargeModel rechargeRequest,
  }) async {
    final url = ApiEndpoints.walletRecharge.path;

    try {
      print('📍 WalletDatasource: Initiating wallet recharge request');
      print('📍 Request URL: $url');
      print('📍 Request data: ${rechargeRequest.toJson()}');
      
      final response = await dioClient.dio.post(
        url,
        data: rechargeRequest.toJson(),
      );

      print('📍 Response status: ${response.statusCode}');
      print('📍 Response data: ${response.data}');

      if (response.statusCode == 201 && response.data['success'] == true) {
        print('📍 About to parse response.data[\'data\']');
        print('📍 response.data[\'data\'] content: ${response.data['data']}');
        return WalletRechargeResponseModel.fromJson(response.data['data']);
      } else {
        throw Exception(
            'Failed to initiate wallet recharge. Please try again.');
      }
    } catch (e) {
      print('📍 Error in initiateWalletRecharge: $e');
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error initiating wallet recharge.');
    }
  }

  Future<void> completeWalletRecharge({
    required int rechargeId,
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  }) async {
    final url = ApiEndpoints.walletRechargeComplete.path
        .replaceAll('{rechargeId}', rechargeId.toString());

    try {
      final response = await dioClient.dio.post(
        url,
        data: {
          'razorpay_order_id': razorpayOrderId,
          'razorpay_payment_id': razorpayPaymentId,
          'razorpay_signature': razorpaySignature,
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return;
      } else {
        throw Exception(
            'Failed to complete wallet recharge. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error completing wallet recharge.');
    }
  }

  Future<void> cancelWalletRecharge({
    required int rechargeId,
  }) async {
    final url = ApiEndpoints.walletRechargeCancel.path
        .replaceAll('{rechargeId}', rechargeId.toString());

    try {
      final response = await dioClient.dio.post(url);

      if (response.statusCode == 200 && response.data['success'] == true) {
        return;
      } else {
        throw Exception('Failed to cancel wallet recharge. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error cancelling wallet recharge.');
    }
  }
}
