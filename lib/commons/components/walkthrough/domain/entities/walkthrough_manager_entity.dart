class WalkthroughManagerEntity {
  final String pageKey;
  final bool isCompleted;
  final int currentStep;

  WalkthroughManagerEntity({
    required this.pageKey,
    required this.isCompleted,
    this.currentStep = 0, // Default to step 0
  });

  WalkthroughManagerEntity copyWith({
    String? pageKey,
    bool? isCompleted,
    int? currentStep,
  }) {
    return WalkthroughManagerEntity(
      pageKey: pageKey ?? this.pageKey,
      isCompleted: isCompleted ?? this.isCompleted,
      currentStep: currentStep ?? this.currentStep,
    );
  }
}
