import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/main_layout/app/views/main_layout_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/app/route_tracker.dart';
import 'package:trees_india/pages/chats_page/app/viewmodels/chats_notifier.dart';
import '../viewmodels/chats_state.dart';
import '../providers/chats_provider.dart';
import 'widgets/chat_room_card.dart';

class ChatsPage extends ConsumerStatefulWidget {
  const ChatsPage({super.key});

  @override
  ConsumerState<ChatsPage> createState() => _ChatsPageState();
}

class _ChatsPageState extends ConsumerState<ChatsPage>
    with WidgetsBindingObserver {
  final ScrollController _scrollController = ScrollController();
  bool _isInitialized = false;
  late NavigationCallback _navigationCallback;
  late ChatsNotifier _notifier;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addObserver(this);

    // Set up navigation callback for auto-refresh control and refresh when returning
    _navigationCallback = (String from, String to, bool isPop) {
      final notifier = ref.read(chatsNotifierProvider.notifier);

      if (isPop && from.startsWith('ChatRoomPage') && to == 'ChatsPage') {
        // User returned from a chat room to chats page - refresh and restart auto-refresh
        debugPrint(
            '🔄 Returning to chats: refreshing list and restarting auto-refresh');
        if (mounted) {
          notifier.loadChatRooms();
          notifier.startAutoRefresh();
        }
      } else if (!isPop &&
          from == 'ChatsPage' &&
          to.startsWith('ChatRoomPage')) {
        // User navigated from chats page to a chat room - stop auto-refresh
        debugPrint('⏸️ Navigating to chat room: stopping auto-refresh');
        notifier.stopAutoRefresh();
      }
    };
    addNavigationCallback(_navigationCallback);

    // Load chat rooms when page is first loaded and start auto-refresh
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _notifier = ref.read(chatsNotifierProvider.notifier);
      _notifier.loadChatRooms();
      _notifier.startAutoRefresh();
      _isInitialized = true;
    });
  }

  // Removed didChangeDependencies() - now using navigation callback system

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);

    // Refresh chat rooms when app comes back to foreground
    if (state == AppLifecycleState.resumed && mounted && _isInitialized) {
      ref.read(chatsNotifierProvider.notifier).loadChatRooms();
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    WidgetsBinding.instance.removeObserver(this);
    removeNavigationCallback(_navigationCallback);
    _notifier.stopAutoRefresh();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.8) {
      ref.read(chatsNotifierProvider.notifier).loadMoreChatRooms();
    }
  }

  @override
  Widget build(BuildContext context) {
    final chatsState = ref.watch(chatsNotifierProvider);

    return MainLayoutWidget(
      currentIndex: 2,
      child: Scaffold(
        appBar: AppBar(
          title: H3Bold(
            text: 'Chats',
            color: AppColors.brandNeutral800,
          ),
          backgroundColor: AppColors.brandNeutral50,
          elevation: 0,
          automaticallyImplyLeading: false,
        ),
        body: _buildBody(chatsState),
      ),
    );
  }

  Widget _buildBody(ChatsState state) {
    switch (state.status) {
      case ChatsStatus.initial:
      case ChatsStatus.loading:
        return const Center(
          child: CircularProgressIndicator(),
        );

      case ChatsStatus.error:
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: Colors.grey[400],
              ),
              const SizedBox(height: 16),
              Text(
                'Failed to load chats',
                style: TextStyle(
                  fontSize: 18,
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                state.errorMessage ?? 'Unknown error occurred',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[500],
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  ref.read(chatsNotifierProvider.notifier).loadChatRooms();
                },
                child: const Text('Retry'),
              ),
            ],
          ),
        );

      case ChatsStatus.loaded:
      case ChatsStatus.loadingMore:
      case ChatsStatus.refreshing:
        if (state.chatRooms.isEmpty) {
          return _buildEmptyState();
        }
        return _buildChatList(state);
    }
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.chat_bubble_outline,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'No chats yet',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Your chat conversations will appear here',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[500],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildChatList(ChatsState state) {
    return RefreshIndicator(
      onRefresh: () async {
        ref.read(chatsNotifierProvider.notifier).refreshChatRooms();
      },
      child: ListView.builder(
        controller: _scrollController,
        physics: const AlwaysScrollableScrollPhysics(),
        itemCount: state.chatRooms.length +
            (state.status == ChatsStatus.loadingMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index >= state.chatRooms.length) {
            return const Padding(
              padding: EdgeInsets.all(16),
              child: Center(
                child: CircularProgressIndicator(),
              ),
            );
          }

          final chatRoom = state.chatRooms[index];
          return ChatRoomCard(chatRoom: chatRoom);
        },
      ),
    );
  }
}
