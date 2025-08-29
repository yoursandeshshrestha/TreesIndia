import '../../domain/entities/wallet_summary_entity.dart';

class WalletSummaryModel {
  final double currentBalance;
  final double totalRecharged;
  final double totalSpent;
  final int totalTransactions;

  const WalletSummaryModel({
    required this.currentBalance,
    required this.totalRecharged,
    required this.totalSpent,
    required this.totalTransactions,
  });

  factory WalletSummaryModel.fromJson(Map<String, dynamic> json) {
    return WalletSummaryModel(
      currentBalance: (json['current_balance'] as num? ?? 0).toDouble(),
      totalRecharged: (json['total_recharge'] as num? ?? 0).toDouble(),
      totalSpent: (json['total_spent'] as num? ?? 0).toDouble(),
      totalTransactions: json['total_transactions'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'current_balance': currentBalance,
      'total_recharge': totalRecharged,
      'total_spent': totalSpent,
      'total_transactions': totalTransactions,
    };
  }

  WalletSummaryEntity toEntity() {
    return WalletSummaryEntity(
      currentBalance: currentBalance,
      totalRecharged: totalRecharged,
      totalSpent: totalSpent,
      totalTransactions: totalTransactions,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is WalletSummaryModel &&
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
    return 'WalletSummaryModel(currentBalance: $currentBalance, totalRecharged: $totalRecharged, totalSpent: $totalSpent, totalTransactions: $totalTransactions)';
  }
}
