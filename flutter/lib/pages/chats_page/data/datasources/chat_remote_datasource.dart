import 'package:dio/dio.dart';
import '../../../../commons/constants/api_endpoints.dart';
import '../../../../commons/utils/services/dio_client.dart';
import '../../../../commons/utils/error_handler.dart';
import '../models/chat_response_model.dart';
import '../models/chat_message_model.dart';
import '../models/chat_room_model.dart';

abstract class ChatRemoteDatasource {
  Future<ChatRoomsResponseModel> getChatRooms({
    int page = 1,
    int limit = 20,
  });

  Future<ChatMessagesResponseModel> getChatMessages(
    int roomId, {
    int page = 1,
    int limit = 50,
  });

  Future<ChatMessageModel> sendMessage(
    int roomId, {
    required String message,
    String messageType = 'text',
  });

  Future<void> markMessageAsRead(int messageId);

  Future<ChatRoomModel> getBookingChatRoom(int bookingId);
}

class ChatRemoteDatasourceImpl implements ChatRemoteDatasource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  ChatRemoteDatasourceImpl({
    required this.dioClient,
    required this.errorHandler,
  });

  @override
  Future<ChatRoomsResponseModel> getChatRooms({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final url = ApiEndpoints.chatRooms.path;
      final queryParams = {
        'page': page,
        'limit': limit,
      };

      final response = await dioClient.dio.get(
        url,
        queryParameters: queryParams,
      );

      return ChatRoomsResponseModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    }
  }

  @override
  Future<ChatMessagesResponseModel> getChatMessages(
    int roomId, {
    int page = 1,
    int limit = 50,
  }) async {
    try {
      final url = ApiEndpoints.chatMessages.path.replaceAll('{roomId}', roomId.toString());
      final queryParams = {
        'page': page,
        'limit': limit,
      };

      final response = await dioClient.dio.get(
        url,
        queryParameters: queryParams,
      );

      return ChatMessagesResponseModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    }
  }

  @override
  Future<ChatMessageModel> sendMessage(
    int roomId, {
    required String message,
    String messageType = 'text',
  }) async {
    try {
      final url = ApiEndpoints.sendMessage.path.replaceAll('{roomId}', roomId.toString());
      final requestBody = {
        'message': message,
        'message_type': messageType,
      };

      final response = await dioClient.dio.post(
        url,
        data: requestBody,
      );

      return ChatMessageModel.fromJson(response.data['data']['message']);
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    }
  }

  @override
  Future<void> markMessageAsRead(int messageId) async {
    try {
      final url = ApiEndpoints.markMessageRead.path.replaceAll('{messageId}', messageId.toString());
      
      await dioClient.dio.post(
        url,
        data: {},
      );
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    }
  }

  @override
  Future<ChatRoomModel> getBookingChatRoom(int bookingId) async {
    try {
      final url = ApiEndpoints.bookingChatRoom.path.replaceAll('{bookingId}', bookingId.toString());

      final response = await dioClient.dio.get(url);

      return ChatRoomModel.fromJson(response.data['data']['chat_room']);
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    }
  }
}