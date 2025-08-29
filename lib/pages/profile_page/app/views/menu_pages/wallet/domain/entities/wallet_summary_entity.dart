class WalletSummaryEntity {
  final double currentBalance;
  final double totalRecharged;
  final double totalSpent;

  final int totalTransactions;

  const WalletSummaryEntity({
    required this.currentBalance,
    required this.totalRecharged,
    required this.totalSpent,
    required this.totalTransactions,
  });

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is WalletSummaryEntity &&
        other.currentBalance == currentBalance &&
        other.totalRecharged == totalRecharged &&
        other.totalSpent == totalSpent &&
        other.totalTransactions == totalTransactions;
  }

  @override
  int get hashCode {
    return currentBalance.hashCode ^
        totalRecharged.hashCode ^
        totalSpent.hashCode ^
        totalTransactions.hashCode;
  }

  @override
  String toString() {
    return 'WalletSummaryEntity(currentBalance: $currentBalance, totalRecharged: $totalRecharged, totalSpent: $totalSpent, totalTransactions: $totalTransactions)';
  }
}
