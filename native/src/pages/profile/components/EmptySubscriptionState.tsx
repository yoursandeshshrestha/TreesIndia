import React from 'react';
import { View, Text } from 'react-native';
import SubscriptionIcon from '../../../components/icons/SubscriptionIcon';

export default function EmptySubscriptionState() {
  return (
    <View className="bg-[#F9FAFB] rounded-xl p-6 border border-[#E5E7EB] items-center">
      <View className="w-20 h-20 bg-[#E5E7EB] rounded-full items-center justify-center mb-4">
        <SubscriptionIcon size={40} color="#6B7280" />
      </View>
      <Text
        className="text-lg font-semibold text-[#1F2937] mb-2"
        style={{ fontFamily: 'Inter-SemiBold' }}
      >
        No Active Subscription
      </Text>
      <Text
        className="text-sm text-[#4B5563] text-center leading-5"
        style={{ fontFamily: 'Inter-Regular' }}
      >
        Subscribe to unlock premium features and get unlimited access to property listings.
      </Text>
    </View>
  );
}


