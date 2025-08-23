import 'wallet_transaction_entity.dart';

class WalletTransactionsResponseEntity {
  final List<WalletTransactionEntity> transactions;
  final PaginationEntity pagination;

  const WalletTransactionsResponseEntity({
    required this.transactions,
    required this.pagination,
  });

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is WalletTransactionsResponseEntity &&
        other.transactions == transactions &&
        other.pagination == pagination;
  }

  @override
  int get hashCode => transactions.hashCode ^ pagination.hashCode;

  @override
  String toString() {
    return 'WalletTransactionsResponseEntity(transactions: $transactions, pagination: $pagination)';
  }
}

class PaginationEntity {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  const PaginationEntity({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is PaginationEntity &&
        other.page == page &&
        other.limit == limit &&
        other.total == total &&
        other.totalPages == totalPages;
  }

  @override
  int get hashCode {
    return page.hashCode ^ limit.hashCode ^ total.hashCode ^ totalPages.hashCode;
  }

  @override
  String toString() {
    return 'PaginationEntity(page: $page, limit: $limit, total: $total, totalPages: $totalPages)';
  }
}