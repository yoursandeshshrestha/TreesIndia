import 'package:equatable/equatable.dart';
import '../../domain/entities/chat_room_entity.dart';

enum ChatsStatus {
  initial,
  loading,
  loaded,
  loadingMore,
  error,
  refreshing,
}

class ChatsState extends Equatable {
  final ChatsStatus status;
  final List<ChatRoomEntity> chatRooms;
  final String? errorMessage;
  final int currentPage;
  final int totalPages;
  final bool hasMoreData;

  const ChatsState({
    this.status = ChatsStatus.initial,
    this.chatRooms = const [],
    this.errorMessage,
    this.currentPage = 1,
    this.totalPages = 1,
    this.hasMoreData = true,
  });

  ChatsState copyWith({
    ChatsStatus? status,
    List<ChatRoomEntity>? chatRooms,
    String? errorMessage,
    int? currentPage,
    int? totalPages,
    bool? hasMoreData,
  }) {
    return ChatsState(
      status: status ?? this.status,
      chatRooms: chatRooms ?? this.chatRooms,
      errorMessage: errorMessage ?? this.errorMessage,
      currentPage: currentPage ?? this.currentPage,
      totalPages: totalPages ?? this.totalPages,
      hasMoreData: hasMoreData ?? this.hasMoreData,
    );
  }

  @override
  List<Object?> get props => [
        status,
        chatRooms,
        errorMessage,
        currentPage,
        totalPages,
        hasMoreData,
      ];
}