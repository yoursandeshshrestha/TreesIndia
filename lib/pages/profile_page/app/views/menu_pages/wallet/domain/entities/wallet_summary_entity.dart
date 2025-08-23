class WalletSummaryEntity {
  final double currentBalance;
  final double totalRecharged;
  final double totalSpent;
  final int pendingTransactions;
  final int completedTransactions;

  const WalletSummaryEntity({
    required this.currentBalance,
    required this.totalRecharged,
    required this.totalSpent,
    required this.pendingTransactions,
    required this.completedTransactions,
  });

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is WalletSummaryEntity &&
        other.currentBalance == currentBalance &&
        other.totalRecharged == totalRecharged &&
        other.totalSpent == totalSpent &&
        other.pendingTransactions == pendingTransactions &&
        other.completedTransactions == completedTransactions;
  }

  @override
  int get hashCode {
    return currentBalance.hashCode ^
        totalRecharged.hashCode ^
        totalSpent.hashCode ^
        pendingTransactions.hashCode ^
        completedTransactions.hashCode;
  }

  @override
  String toString() {
    return 'WalletSummaryEntity(currentBalance: $currentBalance, totalRecharged: $totalRecharged, totalSpent: $totalSpent, pendingTransactions: $pendingTransactions, completedTransactions: $completedTransactions)';
  }
}