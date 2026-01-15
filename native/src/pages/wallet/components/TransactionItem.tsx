import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { WalletTransaction } from '../../../services/api/wallet.service';
import Button from '../../../components/ui/Button';

interface TransactionItemProps {
  transaction: WalletTransaction;
  onCompletePayment?: (transaction: WalletTransaction) => void;
}

export default function TransactionItem({ transaction, onCompletePayment }: TransactionItemProps) {
  const isCredit = () => {
    const type = transaction.type.toLowerCase();
    return type.includes('recharge') || type.includes('refund') || type.includes('credit');
  };

  const getTransactionTitle = () => {
    const type = transaction.type.toLowerCase();
    if (
      type === 'credit' ||
      type === 'recharge' ||
      type === 'wallet_recharge' ||
      type.includes('recharge')
    ) {
      return 'Wallet Recharge';
    } else if (
      type === 'debit' ||
      type === 'payment' ||
      type.includes('debit') ||
      type.includes('payment')
    ) {
      return 'Service Payment';
    } else {
      return 'Transaction';
    }
  };

  const getStatusText = () => {
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
  };

  const getStatusTextColor = () => {
    switch (transaction.status.toLowerCase()) {
      case 'completed':
        return '#059669';
      case 'pending':
        return '#D97706';
      case 'failed':
      case 'abandoned':
      case 'expired':
        return '#DC2626';
      case 'refunded':
        return '#0D9488';
      default:
        return '#4B5563';
    }
  };

  const getStatusBackgroundColor = () => {
    switch (transaction.status.toLowerCase()) {
      case 'completed':
        return '#D1FAE5';
      case 'pending':
        return '#FEF3C7';
      case 'failed':
      case 'abandoned':
      case 'expired':
        return '#FEE2E2';
      case 'refunded':
        return '#CCFBF1';
      default:
        return '#F3F4F6';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'Date not available';
    }

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      const now = new Date();
      const difference = now.getTime() - date.getTime();
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor(difference / (1000 * 60));

      if (days === 0) {
        if (hours === 0) {
          if (minutes < 1) {
            return 'just now';
          } else {
            return `${minutes}m ago`;
          }
        } else {
          return `${hours}h ago`;
        }
      } else if (days === 1) {
        return 'Yesterday';
      } else if (days < 7) {
        return `${days} days ago`;
      } else {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch (error) {
      return 'Invalid date';
    }
  };

  const canCompletePayment = () => {
    return (
      transaction.status.toLowerCase() === 'pending' &&
      transaction.type.toLowerCase().includes('recharge') &&
      transaction.razorpay_order_id != null &&
      transaction.razorpay_order_id.length > 0
    );
  };

  const credit = isCredit();
  const amountColor = credit ? '#059669' : '#DC2626';
  const statusBgColor = getStatusBackgroundColor();
  const statusTextColor = getStatusTextColor();

  return (
    <View className="w-full py-4">
      <View className="flex-row items-start">
        <View className="flex-1">
          <Text
            className="mb-1 font-medium text-sm text-[#111928]"
            style={{ fontFamily: 'Inter-Medium' }}>
            {getTransactionTitle()}
          </Text>
          <View className="flex-row flex-wrap items-center">
            <Text
              className="text-xs text-[#6B7280]"
              style={{
                fontFamily: 'Inter-Regular',
                ...(Platform.OS === 'android' && { includeFontPadding: false }),
              }}>
              {formatDate(
                (transaction as any).CreatedAt ||
                  transaction.created_at ||
                  (transaction as any).initiated_at
              )}
            </Text>
            <View className="mx-2 h-1 w-1 rounded-full bg-[#9CA3AF]" />
            <View className="rounded px-1.5 py-0.5" style={{ backgroundColor: statusBgColor }}>
              <Text
                className="text-xs"
                style={{
                  color: statusTextColor,
                  fontFamily: 'Inter-Regular',
                  ...(Platform.OS === 'android' && { includeFontPadding: false }),
                }}>
                {getStatusText()}
              </Text>
            </View>
          </View>
        </View>
        <View className="ml-3 items-end">
          <Text
            className="font-medium text-sm"
            style={{
              color: amountColor,
              fontFamily: 'Inter-Medium',
            }}>
            {credit ? '+' : '-'}₹{transaction.amount.toFixed(2)}
          </Text>
          <Text
            className="mt-1 text-xs text-[#6B7280]"
            style={{
              fontFamily: 'Inter-Regular',
              ...(Platform.OS === 'android' && { includeFontPadding: false }),
            }}>
            {transaction.method.toUpperCase()}
          </Text>
        </View>
      </View>

      {canCompletePayment() && onCompletePayment && (
        <View className="mt-4 flex-row justify-end">
          <TouchableOpacity
            onPress={() => onCompletePayment(transaction)}
            className="rounded-md px-3 py-1.5"
            style={{ backgroundColor: '#059669' }}
            activeOpacity={0.8}>
            <Text
              className="font-semibold text-xs text-white"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Complete Payment
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
