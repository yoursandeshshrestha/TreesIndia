import 'package:flutter/material.dart';
import '../../../../../../../../../commons/constants/app_colors.dart';
import '../../../../../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../domain/entities/wallet_transaction_entity.dart';

class TransactionItemWidget extends StatelessWidget {
  final WalletTransactionEntity transaction;

  const TransactionItemWidget({
    super.key,
    required this.transaction,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(8.0),
        border: Border.all(
          color: AppColors.brandNeutral200,
          width: 1.0,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: _getIconBackgroundColor(),
              borderRadius: BorderRadius.circular(8.0),
            ),
            child: Icon(
              _getTransactionIcon(),
              color: _getIconColor(),
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                B2Medium(
                  text: _getTransactionTitle(),
                  color: AppColors.brandNeutral800,
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    B3Regular(
                      text: _formatDate(transaction.createdAt),
                      color: AppColors.brandNeutral500,
                    ),
                    const SizedBox(width: 8),
                    Container(
                      width: 4,
                      height: 4,
                      decoration: const BoxDecoration(
                        color: AppColors.brandNeutral400,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: _getStatusBackgroundColor(),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: B3Regular(
                        text: _getStatusText(),
                        color: _getStatusTextColor(),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              B2Medium(
                text:
                    '${_isCredit() ? '+' : '-'}₹${transaction.amount.toStringAsFixed(2)}',
                color: _isCredit()
                    ? AppColors.stateGreen600
                    : AppColors.stateRed600,
              ),
              const SizedBox(height: 4),
              B3Regular(
                text: transaction.method.toUpperCase(),
                color: AppColors.brandNeutral500,
              ),
            ],
          ),
        ],
      ),
    );
  }

  bool _isCredit() {
    return transaction.type.contains('recharge') ||
        transaction.type.contains('refund') ||
        transaction.type.contains('credit');
  }

  IconData _getTransactionIcon() {
    if (transaction.type.contains('recharge')) {
      return Icons.add_circle_outline;
    } else if (transaction.type.contains('debit')) {
      return Icons.remove_circle_outline;
    } else if (transaction.type.contains('refund')) {
      return Icons.refresh;
    } else {
      return Icons.swap_horiz;
    }
  }

  Color _getIconColor() {
    if (_isCredit()) {
      return AppColors.stateGreen600;
    } else {
      return AppColors.stateRed600;
    }
  }

  Color _getIconBackgroundColor() {
    if (_isCredit()) {
      return AppColors.stateGreen50;
    } else {
      return AppColors.stateRed50;
    }
  }

  String _getTransactionTitle() {
    switch (transaction.type) {
      case 'wallet_recharge':
        return 'Wallet Recharge';
      case 'wallet_debit':
        return 'Wallet Debit';
      case 'booking':
        return 'Service Payment';
      case 'refund':
        return 'Refund';
      default:
        return 'Transaction';
    }
  }

  String _getStatusText() {
    switch (transaction.status.toLowerCase()) {
      case 'completed':
        return 'Success';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'refunded':
        return 'Refunded';
      case 'abandoned':
        return 'Cancelled';
      case 'expired':
        return 'Expired';
      default:
        return transaction.status;
    }
  }

  Color _getStatusTextColor() {
    switch (transaction.status.toLowerCase()) {
      case 'completed':
        return AppColors.stateGreen700;
      case 'pending':
        return AppColors.stateYellow700;
      case 'failed':
      case 'abandoned':
      case 'expired':
        return AppColors.stateRed700;
      case 'refunded':
        return AppColors.accentTeal700;
      default:
        return AppColors.brandNeutral600;
    }
  }

  Color _getStatusBackgroundColor() {
    switch (transaction.status.toLowerCase()) {
      case 'completed':
        return AppColors.stateGreen100;
      case 'pending':
        return AppColors.stateYellow100;
      case 'failed':
      case 'abandoned':
      case 'expired':
        return AppColors.stateRed100;
      case 'refunded':
        return AppColors.accentTeal100;
      default:
        return AppColors.brandNeutral100;
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      if (difference.inHours == 0) {
        if (difference.inMinutes < 1) {
          return 'just now';
        } else {
          return '${difference.inMinutes}m ago';
        }
      } else {
        return '${difference.inHours}h ago';
      }
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }
}
