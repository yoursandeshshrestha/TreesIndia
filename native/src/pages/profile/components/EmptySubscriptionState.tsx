import React from 'react';
import { View, Text } from 'react-native';
import SubscriptionIcon from '../../../components/icons/SubscriptionIcon';

export default function EmptySubscriptionState() {
  return (
    <View className="items-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-6">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-[#E5E7EB]">
        <SubscriptionIcon size={40} color="#6B7280" />
      </View>
      <Text
        className="mb-2 font-semibold text-lg text-[#1F2937]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        No Active Subscription
      </Text>
      <Text
        className="text-center text-sm leading-5 text-[#4B5563]"
        style={{ fontFamily: 'Inter-Regular' }}>
        Subscribe to unlock premium features and get unlimited access to property listings.
      </Text>
    </View>
  );
}
