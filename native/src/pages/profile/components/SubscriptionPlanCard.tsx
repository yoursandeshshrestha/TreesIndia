import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { type SubscriptionPlan, type PricingOption } from '../../../services';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  isSelected: boolean;
  selectedDurationType?: 'monthly' | 'yearly';
  onSelect: (planId: number, durationType: 'monthly' | 'yearly') => void;
}

export default function SubscriptionPlanCard({
  plan,
  isSelected,
  selectedDurationType,
  onSelect,
}: SubscriptionPlanCardProps) {
  // Get pricing options from the pricing array
  const pricingOptions = Array.isArray(plan.pricing) && plan.pricing.length > 0 
    ? plan.pricing 
    : [];

  const monthlyOption = pricingOptions.find(p => p.duration_type === 'monthly');
  const yearlyOption = pricingOptions.find(p => p.duration_type === 'yearly');

  const formatPrice = (price: number | undefined): string => {
    const safePrice = typeof price === 'number' ? price : 0;
    return `₹${safePrice.toLocaleString('en-IN')}`;
  };

  const handleSelect = (durationType: 'monthly' | 'yearly') => {
    onSelect(plan.id, durationType);
  };

  // Get features array
  const featuresArray = Array.isArray(plan.features) 
    ? plan.features 
    : (typeof plan.features === 'object' && plan.features !== null
        ? Object.values(plan.features).filter((f): f is string => typeof f === 'string')
        : []);

  return (
    <View
      className="rounded-xl bg-white"
    >
      {/* Header */}
      <View 
        className="bg-[#055c3a] p-4"
        style={{
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <Text
          className="text-lg font-bold text-white mb-1"
          style={{ fontFamily: 'Inter-Bold' }}
        >
          {plan.name}
        </Text>
        {plan.description && (
          <Text
            className="text-sm text-white"
            style={{ 
              fontFamily: 'Inter-Regular',
              lineHeight: 20,
            }}
          >
            {plan.description}
          </Text>
        )}
      </View>

      {/* Content */}
      <View className="p-4">
        {/* Pricing Options */}
        <View className="mb-6">
          <View style={{ gap: 12 }}>
            {/* Monthly Option */}
            {monthlyOption && (
              <PricingOptionCard
                pricing={monthlyOption}
                isSelected={isSelected && selectedDurationType === 'monthly'}
                onSelect={() => handleSelect('monthly')}
              />
            )}

            {/* Yearly Option */}
            {yearlyOption && (
              <PricingOptionCard
                pricing={yearlyOption}
                isSelected={isSelected && selectedDurationType === 'yearly'}
                onSelect={() => handleSelect('yearly')}
                isPopular
              />
            )}
          </View>
        </View>

        {/* Features */}
        {featuresArray.length > 0 && (
          <>
            <Text
              className="text-base font-semibold text-[#111928] mb-4"
              style={{ fontFamily: 'Inter-SemiBold' }}
            >
              What's included:
            </Text>
            {featuresArray.map((feature, index) => {
              const featureText = typeof feature === 'string' ? feature : String(feature || '');
              const featureKey = `feature-${index}-${featureText.substring(0, 10).replace(/\s/g, '-')}`;
              return (
                <View key={featureKey} className="flex-row items-start mb-3">
                  <Image
                    source={require('../../../../assets/icons/common/checkbox.png')}
                    style={{ width: 20, height: 20, marginRight: 12, marginTop: 2 }}
                    resizeMode="contain"
                  />
                  <Text
                    className="flex-1 text-sm text-[#374151]"
                    style={{ 
                      fontFamily: 'Inter-Regular',
                      lineHeight: 20,
                    }}
                  >
                    {featureText.trim()}
                  </Text>
                </View>
              );
            })}
          </>
        )}
      </View>
    </View>
  );
}

interface PricingOptionCardProps {
  pricing: PricingOption;
  isSelected: boolean;
  onSelect: () => void;
  isPopular?: boolean;
}

function PricingOptionCard({ pricing, isSelected, onSelect, isPopular = false }: PricingOptionCardProps) {
  const formatPrice = (price: number): string => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getDurationLabel = (): string => {
    if (pricing.duration_type === 'monthly') return 'month';
    if (pricing.duration_type === 'yearly') return 'year';
    return `${pricing.duration_days} days`;
  };

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.5}
      style={{
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: isSelected ? '#055c3a' : '#E5E7EB',
        backgroundColor: isSelected ? '#F0FDF4' : '#F9FAFB',
      }}
    >
      {/* Badge */}
      {isPopular && (
        <View className="mb-3">
          <View 
            className="px-3 py-1 rounded-xl self-start"
            style={{ backgroundColor: '#055c3a' }}
          >
            <Text
              className="text-xs font-semibold text-white"
              style={{ fontFamily: 'Inter-SemiBold' }}
            >
              Most Popular
            </Text>
          </View>
        </View>
      )}

      {/* Price and Duration */}
      <View className="flex-row items-baseline mb-3">
        <Text
          className={`text-xl font-bold ${
            isSelected ? 'text-[#065F46]' : 'text-[#111928]'
          }`}
          style={{ fontFamily: 'Inter-Bold' }}
        >
          {formatPrice(pricing.price)}
        </Text>
        <Text
          className="text-sm text-[#4B5563] ml-1"
          style={{ fontFamily: 'Inter-Regular' }}
        >
          / {getDurationLabel()}
        </Text>
      </View>

      {/* Button */}
      <View
        style={{
          width: '100%',
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 6,
          backgroundColor: isSelected ? '#055c3a' : '#FFFFFF',
          borderWidth: 1,
          borderColor: '#055c3a',
        }}
      >
        <Text
          className={`text-sm font-semibold text-center ${
            isSelected ? 'text-white' : 'text-[#055c3a]'
          }`}
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          {isSelected ? 'Selected' : 'Select Plan'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
