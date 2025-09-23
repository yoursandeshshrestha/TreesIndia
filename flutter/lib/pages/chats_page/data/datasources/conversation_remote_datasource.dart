import 'package:dio/dio.dart';
import '../../../../commons/constants/api_endpoints.dart';
import '../../../../commons/utils/services/dio_client.dart';
import '../../../../commons/utils/error_handler.dart';
import '../models/conversation_model.dart';
import '../models/conversation_message_model.dart';

abstract class ConversationRemoteDatasource {
  Future<ConversationsResponseModel> getConversations({
    int page = 1,
    int limit = 20,
  });

  Future<ConversationModel> getConversation(int conversationId);

  Future<ConversationMessagesResponseModel> getConversationMessages(
    int conversationId, {
    int page = 1,
    int limit = 50,
  });

  Future<ConversationModel> createConversation({
    required int user1,
    required int user2,
  });

  Future<ConversationMessageModel> sendMessage(
    int conversationId, {
    required String message,
  });

  Future<void> markMessageAsRead(int messageId);

  Future<void> markConversationAsRead(int conversationId);

  Future<Map<String, dynamic>> getConversationUnreadCount(int conversationId);

  Future<Map<String, dynamic>> getTotalUnreadCount();
}

class ConversationRemoteDatasourceImpl implements ConversationRemoteDatasource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  ConversationRemoteDatasourceImpl({
    required this.dioClient,
    required this.errorHandler,
  });

  @override
  Future<ConversationsResponseModel> getConversations({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final url = ApiEndpoints.conversations.path;
      final queryParams = {
        'page': page,
        'limit': limit,
      };

      final response = await dioClient.dio.get(
        url,
        queryParameters: queryParams,
      );

      return ConversationsResponseModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    }
  }

  @override
  Future<ConversationModel> getConversation(int conversationId) async {
    try {
      final url = '${ApiEndpoints.conversations.path}/$conversationId';

      final response = await dioClient.dio.get(url);

      return ConversationModel.fromJson(response.data['data']['conversation']);
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    }
  }

  @override
  Future<ConversationMessagesResponseModel> getConversationMessages(
    int conversationId, {
    int page = 1,
    int limit = 50,
  }) async {
    try {
      final url = ApiEndpoints.conversationMessages.path
          .replaceAll('{conversationId}', conversationId.toString());
      final queryParams = {
        'page': page,
        'limit': limit,
      };

      final response = await dioClient.dio.get(
        url,
        queryParameters: queryParams,
      );

      return ConversationMessagesResponseModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    }
  }

  @override
  Future<ConversationModel> createConversation({
    required int user1,
    required int user2,
  }) async {
    try {
      final url = ApiEndpoints.createConversation.path;
      final requestBody = CreateConversationRequestModel(
        user1: user1,
        user2: user2,
      ).toJson();

      final response = await dioClient.dio.post(
        url,
        data: requestBody,
      );

      return ConversationModel.fromJson(response.data['data']['conversation']);
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    }
  }

  @override
  Future<ConversationMessageModel> sendMessage(
    int conversationId, {
    required String message,
  }) async {
    try {
      final url = ApiEndpoints.sendConversationMessage.path
          .replaceAll('{conversationId}', conversationId.toString());
      final requestBody = SendConversationMessageRequestModel(
        message: message,
      ).toJson();

      final response = await dioClient.dio.post(
        url,
        data: requestBody,
      );

      return ConversationMessageModel.fromJson(response.data['data']['message']);
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    }
  }

  @override
  Future<void> markMessageAsRead(int messageId) async {
    try {
      final url = ApiEndpoints.markConversationMessageRead.path
          .replaceAll('{messageId}', messageId.toString());

      await dioClient.dio.put(
        url,
        data: {},
      );
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    }
  }

  @override
  Future<void> markConversationAsRead(int conversationId) async {
    try {
      final url = ApiEndpoints.markConversationAsRead.path
          .replaceAll('{conversationId}', conversationId.toString());

      await dioClient.dio.put(
        url,
        data: {},
      );
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    }
  }

  @override
  Future<Map<String, dynamic>> getConversationUnreadCount(int conversationId) async {
    try {
      final url = ApiEndpoints.getConversationUnreadCount.path
          .replaceAll('{conversationId}', conversationId.toString());

      final response = await dioClient.dio.get(url);

      return response.data['data'];
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    }
  }

  @override
  Future<Map<String, dynamic>> getTotalUnreadCount() async {
    try {
      final url = ApiEndpoints.getTotalUnreadCount.path;

      final response = await dioClient.dio.get(url);

      return response.data['data'];
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    }
  }
}