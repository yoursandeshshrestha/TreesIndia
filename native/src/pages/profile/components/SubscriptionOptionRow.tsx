import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { type PricingOption } from '../../../services';

interface SubscriptionOptionRowProps {
  pricing: PricingOption;
  planName: string;
  isSelected: boolean;
  onSelect: () => void;
  originalPrice?: number; // For showing strikethrough price
  savePercentage?: number; // For showing save badge
}

export default function SubscriptionOptionRow({
  pricing,
  planName,
  isSelected,
  onSelect,
  originalPrice,
  savePercentage,
}: SubscriptionOptionRowProps) {
  const formatPrice = (price: number): string => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getDurationLabel = (): string => {
    if (pricing.duration_type === 'monthly') return 'month';
    if (pricing.duration_type === 'yearly') return 'year';
    return `${pricing.duration_days} days`;
  };

  const durationDisplay = getDurationLabel();

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.7}
      className="flex-row items-center py-4"
    >
      {/* Radio Button */}
      <View className="mr-4">
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: isSelected ? '#055c3a' : '#E5E7EB',
            backgroundColor: isSelected ? '#055c3a' : '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isSelected && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#FFFFFF',
              }}
            />
          )}
        </View>
      </View>

      {/* Plan Name */}
      <Text
        className="text-base font-medium text-[#111928] mr-3"
        style={{ fontFamily: 'Inter-Medium' }}
      >
        {planName}
      </Text>

      {/* Save Badge */}
      {savePercentage && savePercentage > 0 && (
        <View
          className="px-3 py-1 rounded-full mr-3"
          style={{ backgroundColor: '#055c3a' }}
        >
          <Text
            className="text-xs font-semibold text-white"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            Save {savePercentage}%
          </Text>
        </View>
      )}

      {/* Price Section */}
      <View className="flex-1 flex-row items-center justify-end">
        {originalPrice && originalPrice > pricing.price && (
          <Text
            className="text-sm text-[#9CA3AF] mr-2"
            style={{
              fontFamily: 'Inter-Regular',
              textDecorationLine: 'line-through',
            }}
          >
            ₹{originalPrice.toLocaleString('en-IN')}
          </Text>
        )}
        <Text
          className="text-base font-medium text-[#111928]"
          style={{ fontFamily: 'Inter-Medium' }}
        >
          {formatPrice(pricing.price)} / {durationDisplay}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

