import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { WalletSummary } from '../../../services/api/wallet.service';
import PlusIcon from '../../../components/icons/PlusIcon';

interface WalletBalanceCardProps {
  walletSummary: WalletSummary;
  onRecharge: () => void;
}

export default function WalletBalanceCard({
  walletSummary,
  onRecharge,
}: WalletBalanceCardProps) {
  return (
    <View className="w-full">
      <View className="mb-6">
        {/* Treesindia Cash Label */}
        <Text
          className="text-base font-semibold text-[#111928] mb-1"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          Treesindia Cash
        </Text>

        {/* Balance Amount */}
        <Text
          className="text-2xl font-bold text-[#111928] mb-1"
          style={{ fontFamily: 'Inter-Bold' }}
        >
          ₹{walletSummary.current_balance.toFixed(2)}
        </Text>

        {/* Explanatory Text */}
        <Text
          className="text-xs text-[#6B7280]"
          style={{
            fontFamily: 'Inter-Regular',
            lineHeight: 16,
            ...(Platform.OS === 'android' && { includeFontPadding: false }),
          }}
        >
          Applicable on all services
        </Text>
      </View>

      {/* Recharge Button */}
      <TouchableOpacity
        onPress={onRecharge}
        className="flex-row items-center"
        activeOpacity={0.7}
      >
        <View className="mr-3">
          <PlusIcon size={20} color="#055c3a" />
        </View>
        <Text
          className="text-base font-medium text-[#055c3a]"
          style={{ fontFamily: 'Inter-Medium' }}
        >
          Recharge Wallet
        </Text>
      </TouchableOpacity>
    </View>
  );
}

