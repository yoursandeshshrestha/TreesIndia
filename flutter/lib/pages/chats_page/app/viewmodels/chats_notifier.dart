import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/chat_room_entity.dart';
import '../../domain/usecases/get_chat_rooms_usecase.dart';
import 'chats_state.dart';

class ChatsNotifier extends StateNotifier<ChatsState> {
  final GetChatRoomsUseCase getChatRoomsUseCase;
  Timer? _autoRefreshTimer;

  ChatsNotifier({
    required this.getChatRoomsUseCase,
  }) : super(const ChatsState());

  Future<void> loadChatRooms({bool refresh = false}) async {
    if (refresh) {
      state = state.copyWith(
        status: ChatsStatus.refreshing,
        currentPage: 1,
      );
    } else if (state.status == ChatsStatus.initial) {
      state = state.copyWith(status: ChatsStatus.loading);
    }

    try {
      final response = await getChatRoomsUseCase.execute(
        page: refresh ? 1 : state.currentPage,
        limit: 20,
      );

      final newChatRooms = response.chatRooms;
      final pagination = response.pagination;

      List<ChatRoomEntity> allChatRooms;
      if (refresh || state.currentPage == 1) {
        allChatRooms = newChatRooms;
      } else {
        allChatRooms = [...state.chatRooms, ...newChatRooms];
      }

      state = state.copyWith(
        status: ChatsStatus.loaded,
        chatRooms: allChatRooms,
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        hasMoreData: pagination.page < pagination.totalPages,
        errorMessage: null,
      );
    } catch (error) {
      state = state.copyWith(
        status: ChatsStatus.error,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> loadMoreChatRooms() async {
    if (!state.hasMoreData || state.status == ChatsStatus.loadingMore) {
      return;
    }

    state = state.copyWith(status: ChatsStatus.loadingMore);

    try {
      final response = await getChatRoomsUseCase.execute(
        page: state.currentPage + 1,
        limit: 20,
      );

      final newChatRooms = response.chatRooms;
      final pagination = response.pagination;

      state = state.copyWith(
        status: ChatsStatus.loaded,
        chatRooms: [...state.chatRooms, ...newChatRooms],
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        hasMoreData: pagination.page < pagination.totalPages,
        errorMessage: null,
      );
    } catch (error) {
      state = state.copyWith(
        status: ChatsStatus.error,
        errorMessage: error.toString(),
      );
    }
  }

  void refreshChatRooms() {
    loadChatRooms(refresh: true);
  }

  void startAutoRefresh() {
    _autoRefreshTimer?.cancel();
    _autoRefreshTimer = Timer.periodic(const Duration(seconds: 20), (timer) {
      if (state.chatRooms.isNotEmpty) {
        refreshChatRooms();
      }
    });
  }

  void stopAutoRefresh() {
    _autoRefreshTimer?.cancel();
    _autoRefreshTimer = null;
  }

  @override
  void dispose() {
    _autoRefreshTimer?.cancel();
    super.dispose();
  }
}