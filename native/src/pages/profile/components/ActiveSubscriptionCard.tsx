import React from 'react';
import { View, Text } from 'react-native';
import { type UserSubscription } from '../../../services';
import SubscriptionIcon from '../../../components/icons/SubscriptionIcon';

interface ActiveSubscriptionCardProps {
  subscription: UserSubscription;
}

export default function ActiveSubscriptionCard({ subscription }: ActiveSubscriptionCardProps) {
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

  const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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
  const daysRemaining = getDaysRemaining(subscription.end_date);
  const isExpiringSoon = daysRemaining <= 7;

  return (
    <View className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
      {/* Header with icon and status */}
      <View className="mb-4 flex-row items-center">
        <View className="rounded-full bg-[#055c3a] p-2">
          <SubscriptionIcon size={20} color="#FFFFFF" />
        </View>
        <View className="ml-3 flex-1">
          <Text
            className="font-semibold text-base text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}>
            {subscription.plan?.name || 'Subscription Plan'}
          </Text>
          <View className="mt-1">
            <View
              className={`self-start rounded-xl px-2 py-1 ${
                isActive ? 'bg-[#D1FAE5]' : 'bg-[#E5E7EB]'
              }`}>
              <Text
                className={`font-semibold text-xs ${
                  isActive ? 'text-[#065F46]' : 'text-[#4B5563]'
                }`}
                style={{ fontFamily: 'Inter-SemiBold' }}>
                {getStatusDisplay(subscription.status)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Subscription details */}
      <View className="rounded-lg border border-[#E5E7EB] bg-white p-4">
        <DetailRow label="One-time payment" value={formatAmount(subscription.amount)} isAmount />
        <View className="h-3" />
        <DetailRow label="Expires" value={formatDate(subscription.end_date)} />
        <View className="h-3" />
        <DetailRow label="Days remaining" value={`${daysRemaining}`} highlight={isExpiringSoon} />
      </View>
    </View>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  isAmount?: boolean;
  highlight?: boolean;
}

function DetailRow({ label, value, isAmount = false, highlight = false }: DetailRowProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-[#4B5563]" style={{ fontFamily: 'Inter-Regular' }}>
        {label}
      </Text>
      <Text
        className={`${isAmount ? 'text-base' : 'text-sm'} font-semibold ${
          highlight ? 'text-[#B3261E]' : isAmount ? 'text-[#111928]' : 'text-[#1F2937]'
        }`}
        style={{ fontFamily: isAmount ? 'Inter-Bold' : 'Inter-SemiBold' }}>
        {value}
      </Text>
    </View>
  );
}
