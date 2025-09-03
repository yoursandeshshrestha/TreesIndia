import 'wallet_transaction_model.dart';
import '../../domain/entities/wallet_transactions_response_entity.dart';

class WalletTransactionsResponseModel {
  final List<WalletTransactionModel> transactions;
  final PaginationModel pagination;

  const WalletTransactionsResponseModel({
    required this.transactions,
    required this.pagination,
  });

  factory WalletTransactionsResponseModel.fromJson(Map<String, dynamic> json) {
    return WalletTransactionsResponseModel(
      transactions: (json['transactions'] as List<dynamic>?)
              ?.map((transaction) => WalletTransactionModel.fromJson(
                  transaction as Map<String, dynamic>))
              .toList() ??
          [],
      pagination: PaginationModel.fromJson(
          json['pagination'] as Map<String, dynamic>? ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'transactions':
          transactions.map((transaction) => transaction.toJson()).toList(),
      'pagination': pagination.toJson(),
    };
  }

  WalletTransactionsResponseEntity toEntity() {
    return WalletTransactionsResponseEntity(
      transactions:
          transactions.map((transaction) => transaction.toEntity()).toList(),
      pagination: pagination.toEntity(),
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is WalletTransactionsResponseModel &&
        other.transactions == transactions &&
        other.pagination == pagination;
  }

  @override
  int get hashCode => transactions.hashCode ^ pagination.hashCode;

  @override
  String toString() {
    return 'WalletTransactionsResponseModel(transactions: $transactions, pagination: $pagination)';
  }
}

class PaginationModel {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  const PaginationModel({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  factory PaginationModel.fromJson(Map<String, dynamic> json) {
    return PaginationModel(
      page: json['page'] as int? ?? 1,
      limit: json['limit'] as int? ?? 10,
      total: json['total'] as int? ?? 0,
      totalPages: json['total_pages'] as int? ?? 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'page': page,
      'limit': limit,
      'total': total,
      'total_pages': totalPages,
    };
  }

  PaginationEntity toEntity() {
    return PaginationEntity(
      page: page,
      limit: limit,
      total: total,
      totalPages: totalPages,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is PaginationModel &&
        other.page == page &&
        other.limit == limit &&
        other.total == total &&
        other.totalPages == totalPages;
  }

  @override
  int get hashCode {
    return page.hashCode ^
        limit.hashCode ^
        total.hashCode ^
        totalPages.hashCode;
  }

  @override
  String toString() {
    return 'PaginationModel(page: $page, limit: $limit, total: $total, totalPages: $totalPages)';
  }
}
