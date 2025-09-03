class SplashScreenState {
  final int currentPage;
  final bool isLoading;

  const SplashScreenState({
    this.currentPage = 0,
    this.isLoading = false,
  });

  SplashScreenState copyWith({
    int? currentPage,
    bool? isLoading,
  }) {
    return SplashScreenState(
      currentPage: currentPage ?? this.currentPage,
      isLoading: isLoading ?? this.isLoading,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is SplashScreenState &&
        other.currentPage == currentPage &&
        other.isLoading == isLoading;
  }

  @override
  int get hashCode => currentPage.hashCode ^ isLoading.hashCode;
}
