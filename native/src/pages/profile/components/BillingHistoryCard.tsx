import React from 'react';
import { View, Text } from 'react-native';
import { type SubscriptionHistory } from '../../../services';

interface BillingHistoryCardProps {
  subscription: SubscriptionHistory;
}

export default function BillingHistoryCard({ subscription }: BillingHistoryCardProps) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusDisplay = (status: string): string => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const isActive = subscription.status === 'active';

  return (
    <View className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <View className="flex-row items-center">
        {/* Date and Plan Section */}
        <View className="mr-3 flex-1">
          <Text
            className="mb-1 font-semibold text-sm text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}>
            {formatDate(subscription.start_date)}
          </Text>
          <Text className="text-xs text-[#4B5563]" style={{ fontFamily: 'Inter-Regular' }}>
            {subscription.plan?.name || 'Growth Plan'}
          </Text>
        </View>

        {/* Amount Section */}
        <View className="mr-3">
          <Text className="font-bold text-sm text-[#111928]" style={{ fontFamily: 'Inter-Bold' }}>
            {formatAmount(subscription.amount)}
          </Text>
        </View>

        {/* Status Badge */}
        <View className={`rounded-xl px-2 py-1 ${isActive ? 'bg-[#D1FAE5]' : 'bg-[#F3F4F6]'}`}>
          <Text
            className={`font-semibold text-xs ${isActive ? 'text-[#065F46]' : 'text-[#4B5563]'}`}
            style={{ fontFamily: 'Inter-SemiBold' }}>
            {getStatusDisplay(subscription.status)}
          </Text>
        </View>
      </View>
    </View>
  );
}
