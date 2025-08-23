import '../../domain/entities/wallet_summary_entity.dart';

class WalletSummaryModel {
  final double currentBalance;
  final double totalRecharged;
  final double totalSpent;
  final int pendingTransactions;
  final int completedTransactions;

  const WalletSummaryModel({
    required this.currentBalance,
    required this.totalRecharged,
    required this.totalSpent,
    required this.pendingTransactions,
    required this.completedTransactions,
  });

  factory WalletSummaryModel.fromJson(Map<String, dynamic> json) {
    return WalletSummaryModel(
      currentBalance: (json['current_balance'] as num? ?? 0).toDouble(),
      totalRecharged: (json['total_recharge'] as num? ?? 0).toDouble(),
      totalSpent: (json['total_spent'] as num? ?? 0).toDouble(),
      pendingTransactions: 0, // Not provided by API, defaulting to 0
      completedTransactions: json['total_transactions'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'current_balance': currentBalance,
      'total_recharged': totalRecharged,
      'total_spent': totalSpent,
      'pending_transactions': pendingTransactions,
      'completed_transactions': completedTransactions,
    };
  }

  WalletSummaryEntity toEntity() {
    return WalletSummaryEntity(
      currentBalance: currentBalance,
      totalRecharged: totalRecharged,
      totalSpent: totalSpent,
      pendingTransactions: pendingTransactions,
      completedTransactions: completedTransactions,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is WalletSummaryModel &&
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
    return 'WalletSummaryModel(currentBalance: $currentBalance, totalRecharged: $totalRecharged, totalSpent: $totalSpent, pendingTransactions: $pendingTransactions, completedTransactions: $completedTransactions)';
  }
}