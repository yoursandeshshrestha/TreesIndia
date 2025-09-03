import 'package:dio/dio.dart';
import 'package:trees_india/commons/constants/api_endpoints.dart';
import 'package:trees_india/commons/utils/error_handler.dart';
import 'package:trees_india/commons/utils/services/dio_client.dart';
import '../models/address_model.dart';

abstract class AddressRemoteDataSource {
  Future<AddressListResponseModel> getAddresses();
  Future<AddressModel> createAddress(CreateAddressRequestModel request);
  Future<AddressModel> updateAddress(UpdateAddressRequestModel request);
  Future<void> deleteAddress(int addressId);
}

class AddressRemoteDataSourceImpl implements AddressRemoteDataSource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  AddressRemoteDataSourceImpl({
    required this.dioClient,
    required this.errorHandler,
  });

  @override
  Future<AddressListResponseModel> getAddresses() async {
    try {
      final response = await dioClient.dio.get(ApiEndpoints.addresses.path);

      return AddressListResponseModel.fromJson(response.data);
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        throw Exception(e.toString());
      }
      rethrow;
    }
  }

  @override
  Future<AddressModel> createAddress(CreateAddressRequestModel request) async {
    try {
      final response = await dioClient.dio.post(
        ApiEndpoints.createAddress.path,
        data: request.toJson(),
      );

      return AddressModel.fromJson(response.data['data']);
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        throw Exception(e.toString());
      }
      rethrow;
    }
  }

  @override
  Future<AddressModel> updateAddress(UpdateAddressRequestModel request) async {
    try {
      final response = await dioClient.dio.put(
        ApiEndpoints.updateAddress.path.replaceAll('{addressId}', '${request.id}'),
        data: request.toJson(),
      );

      return AddressModel.fromJson(response.data['data']);
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        throw Exception(e.toString());
      }
      rethrow;
    }
  }

  @override
  Future<void> deleteAddress(int addressId) async {
    try {
      await dioClient.dio.delete(
        ApiEndpoints.deleteAddress.path.replaceAll('{addressId}', '$addressId'),
      );
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        throw Exception(e.toString());
      }
      rethrow;
    }
  }
}
