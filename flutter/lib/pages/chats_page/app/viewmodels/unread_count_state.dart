class UnreadCountState {
  final int totalUnreadCount;
  final bool isLoading;
  final bool isConnected;
  final String? error;

  const UnreadCountState({
    this.totalUnreadCount = 0,
    this.isLoading = false,
    this.isConnected = false,
    this.error,
  });

  UnreadCountState copyWith({
    int? totalUnreadCount,
    bool? isLoading,
    bool? isConnected,
    String? error,
  }) {
    return UnreadCountState(
      totalUnreadCount: totalUnreadCount ?? this.totalUnreadCount,
      isLoading: isLoading ?? this.isLoading,
      isConnected: isConnected ?? this.isConnected,
      error: error ?? this.error,
    );
  }
}