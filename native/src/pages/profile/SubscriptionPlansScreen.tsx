import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { subscriptionService, walletService, type SubscriptionPlan, type PricingOption } from '../../services';
import { razorpayService } from '../../utils/razorpay';
import { useAppSelector } from '../../store/hooks';
import Button from '../../components/ui/Button';
import BackIcon from '../../components/icons/BackIcon';
import SubscriptionOptionRow from './components/SubscriptionOptionRow';
import PaymentMethodModal from './components/PaymentMethodModal';

interface SubscriptionPlansScreenProps {
  onBack: () => void;
  onPurchaseSuccess?: () => void;
}

export default function SubscriptionPlansScreen({
  onBack,
  onPurchaseSuccess,
}: SubscriptionPlansScreenProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedDurationType, setSelectedDurationType] = useState<'monthly' | 'yearly' | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const [plansData, walletData] = await Promise.all([
        subscriptionService.getSubscriptionPlans(),
        walletService.getWalletSummary(),
      ]);

      setPlans(plansData);
      setWalletBalance(walletData.current_balance);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load subscription plans. Please try again.';
      setError(errorMessage);
      if (!refresh) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Preselect Annual (yearly) plan by default when plans are loaded
  useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
      // Find the first plan with a yearly option
      for (const plan of plans) {
        if (Array.isArray(plan.pricing)) {
          const yearlyPricing = plan.pricing.find(p => p.duration_type === 'yearly');
          if (yearlyPricing) {
            setSelectedPlanId(plan.id);
            setSelectedDurationType('yearly');
            return;
          }
        }
      }
      
      // If no yearly option found, select the first available pricing option
      const firstPlan = plans[0];
      if (firstPlan && Array.isArray(firstPlan.pricing) && firstPlan.pricing.length > 0) {
        const firstPricing = firstPlan.pricing[0];
        setSelectedPlanId(firstPlan.id);
        setSelectedDurationType(firstPricing.duration_type);
      }
    }
  }, [plans, selectedPlanId]);

  const handleSelectPlan = (planId: number, durationType: 'monthly' | 'yearly') => {
    setSelectedPlanId(planId);
    setSelectedDurationType(durationType);
  };

  const handlePaymentMethodSelect = async (method: 'wallet' | 'razorpay') => {
    if (!selectedPlanId || !selectedDurationType) return;

    setIsPurchasing(true);
    setShowPaymentModal(false);

    try {
      if (method === 'wallet') {
        // Direct purchase with wallet
        await subscriptionService.purchaseSubscription(selectedPlanId, 'wallet', selectedDurationType);

        Alert.alert(
          'Success',
          'Subscription purchased successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onPurchaseSuccess) {
                  onPurchaseSuccess();
                }
                onBack();
              },
            },
          ]
        );
      } else if (method === 'razorpay') {
        // Create payment order and open Razorpay
        if (!razorpayService.isAvailable()) {
          Alert.alert(
            'Payment Gateway Unavailable',
            'Razorpay SDK is not available. Please ensure react-native-razorpay is installed.',
            [{ text: 'OK' }]
          );
          setIsPurchasing(false);
          return;
        }

        const paymentData = await subscriptionService.createPaymentOrder(
          selectedPlanId,
          selectedDurationType || undefined
        );
        const razorpayKey = razorpayService.getRazorpayKey();

        if (!razorpayKey) {
          Alert.alert(
            'Configuration Error',
            'Razorpay key is not configured.',
            [{ text: 'OK' }]
          );
          setIsPurchasing(false);
          return;
        }

        const paymentId = paymentData.payment.ID || paymentData.payment.id;
        if (!paymentId) {
          throw new Error('Invalid payment ID received from server');
        }

        await razorpayService.openCheckout(
          {
            key: razorpayKey,
            amount: paymentData.payment_order.amount,
            currency: paymentData.payment_order.currency,
            order_id: paymentData.payment_order.id,
            name: 'Trees India',
            description: `Subscription: ${plans.find(p => p.id === selectedPlanId)?.name || 'Plan'}`,
            prefill: {
              contact: user?.phone || '',
              email: user?.email || '',
            },
            theme: {
              color: '#055c3a',
            },
          },
          async (response) => {
            // Payment successful
            try {
              await subscriptionService.completePurchase(
                paymentId,
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );

              Alert.alert(
                'Success',
                'Subscription purchased successfully!',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      if (onPurchaseSuccess) {
                        onPurchaseSuccess();
                      }
                      onBack();
                    },
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert(
                'Payment Verification Failed',
                error?.message || 'Failed to verify payment. Please contact support.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsPurchasing(false);
            }
          },
          (error) => {
            // Payment failed or cancelled
            if (error.code === 'NETWORK_ERROR') {
              Alert.alert(
                'Network Error',
                'Please check your internet connection and try again.',
                [{ text: 'OK' }]
              );
            } else if (error.code !== 'PAYMENT_CANCELLED') {
              Alert.alert(
                'Payment Failed',
                error.description || 'Payment could not be processed. Please try again.',
                [{ text: 'OK' }]
              );
            }
            setIsPurchasing(false);
          }
        );
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to purchase subscription. Please try again.';
      Alert.alert('Error', errorMessage);
      setIsPurchasing(false);
    }
  };

  // Flatten all pricing options from all plans into a single list
  const allPricingOptions = useMemo(() => {
    const options: {
      planId: number;
      planName: string;
      pricing: PricingOption;
      originalPrice?: number;
      savePercentage?: number;
    }[] = [];

    plans.forEach((plan) => {
      if (Array.isArray(plan.pricing)) {
        plan.pricing.forEach((pricing) => {
          // Calculate savings compared to monthly
          let originalPrice: number | undefined;
          let savePercentage: number | undefined;

          if (pricing.duration_type === 'yearly') {
            // Compare yearly price to 12 months of monthly price
            const monthlyPricing = plan.pricing.find(p => p.duration_type === 'monthly');
            if (monthlyPricing) {
              originalPrice = monthlyPricing.price * 12;
              if (originalPrice > pricing.price) {
                savePercentage = Math.round(((originalPrice - pricing.price) / originalPrice) * 100);
              }
            }
          } else if (pricing.duration_type === 'monthly') {
            // For monthly, we could compare to a base price if available
            // For now, no savings shown for monthly
          }

          options.push({
            planId: plan.id,
            planName: pricing.duration_type === 'yearly' ? 'Annual' : 
                     pricing.duration_type === 'monthly' ? 'Monthly' : 
                     'Quarter',
            pricing,
            originalPrice,
            savePercentage,
          });
        });
      }
    });

    // Sort: Yearly first, then Monthly
    return options.sort((a, b) => {
      if (a.pricing.duration_type === 'yearly') return -1;
      if (b.pricing.duration_type === 'yearly') return 1;
      if (a.pricing.duration_type === 'monthly') return -1;
      if (b.pricing.duration_type === 'monthly') return 1;
      return 0;
    });
  }, [plans]);

  const renderContent = () => {
    // Calculate selected plan inside render to ensure it's always up-to-date
    const selectedPlan = selectedPlanId ? plans.find(p => p.id === selectedPlanId) : null;
    
    // Get price from the selected pricing option
    let selectedPlanPrice = 0;
    if (selectedPlan && selectedDurationType && Array.isArray(selectedPlan.pricing)) {
      const selectedPricing = selectedPlan.pricing.find(
        p => p.duration_type === selectedDurationType
      );
      selectedPlanPrice = selectedPricing?.price || 0;
    }

    // Get features from selected plan
    const featuresArray = selectedPlan
      ? (() => {
          if (Array.isArray(selectedPlan.features)) {
            return selectedPlan.features;
          }
          if (typeof selectedPlan.features === 'object' && selectedPlan.features !== null) {
            // Backend stores features as {"description": "feature1\nfeature2\nfeature3"}
            if ('description' in selectedPlan.features && typeof selectedPlan.features.description === 'string') {
              // Split by newline and filter out empty strings
              return selectedPlan.features.description.split('\n').filter((f: string) => f.trim() !== '');
            }
            // Fallback: try to extract string values from object
            return Object.values(selectedPlan.features).filter((f): f is string => typeof f === 'string');
          }
          return [];
        })()
      : [];
    if (isLoading && !isRefreshing) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#055c3a" />
          <Text
            className="text-sm text-[#6B7280] mt-4"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            Loading subscription plans...
          </Text>
        </View>
      );
    }

    if (error && !isRefreshing) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Text
            className="text-lg font-semibold text-[#111928] mb-2"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            Failed to load plans
          </Text>
          <Text
            className="text-sm text-[#6B7280] text-center mb-6"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            {error}
          </Text>
          <Button
            label="Try Again"
            onPress={() => loadData()}
            variant="solid"
          />
        </View>
      );
    }

    if (plans.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Text
            className="text-lg font-semibold text-[#111928] mb-2"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            No Plans Available
          </Text>
          <Text
            className="text-sm text-[#6B7280] text-center"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            There are no subscription plans available at the moment.
          </Text>
        </View>
      );
    }

    return (
      <>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadData(true)}
              tintColor="#055c3a"
            />
          }
        >
          <View className="px-6 pt-6 pb-24">
            {/* Subscription Options List */}
            {allPricingOptions.map((option, index) => {
              const isSelected = selectedPlanId === option.planId && 
                                selectedDurationType === option.pricing.duration_type;
              
              return (
                <SubscriptionOptionRow
                  key={`${option.planId}-${option.pricing.duration_type}-${index}`}
                  pricing={option.pricing}
                  planName={option.planName}
                  isSelected={isSelected}
                  onSelect={() => handleSelectPlan(option.planId, option.pricing.duration_type)}
                  originalPrice={option.originalPrice}
                  savePercentage={option.savePercentage}
                />
              );
            })}

            {/* Separator */}
            <View className="h-px bg-[#E5E7EB] my-6" />

            {/* Features List */}
            {featuresArray.length > 0 && (
              <>
                {featuresArray.map((feature, index) => {
                  const featureText = typeof feature === 'string' ? feature : String(feature || '');
                  const featureKey = `feature-${index}-${featureText.substring(0, 10).replace(/\s/g, '-')}`;
                  return (
                    <View key={featureKey} className="flex-row items-start mb-3">
                      <Image
                        source={require('../../../assets/icons/common/checkbox.png')}
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
        </ScrollView>

        {/* Subscribe Button */}
        {selectedPlanId && (
          <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-6 pt-4 pb-16">
            <Button
              label={
                isPurchasing
                  ? 'Processing...'
                  : `Subscribe ₹${(selectedPlanPrice || 0).toLocaleString('en-IN')}`
              }
              onPress={() => {
                if (selectedPlanId && selectedDurationType) {
                  setShowPaymentModal(true);
                }
              }}
              isLoading={isPurchasing}
              disabled={isPurchasing || !selectedPlanId || !selectedDurationType}
              variant="solid"
            />
          </View>
        )}
      </>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-[#E5E7EB]">
        <TouchableOpacity
          onPress={onBack}
          className="p-2 -ml-2"
          activeOpacity={0.7}
        >
          <BackIcon size={24} color="#111928" />
        </TouchableOpacity>
        <Text
          className="text-xl font-semibold text-[#111928] ml-2"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          Subscription Plans
        </Text>
      </View>

      {/* Content */}
      {renderContent()}

      {/* Payment Method Modal */}
      <PaymentMethodModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSelectMethod={handlePaymentMethodSelect}
        walletBalance={walletBalance}
        amount={(() => {
          // Calculate price when modal is rendered - same logic as in renderContent
          const currentSelectedPlan = selectedPlanId ? plans.find(p => p.id === selectedPlanId) : null;
          if (currentSelectedPlan && selectedDurationType && Array.isArray(currentSelectedPlan.pricing)) {
            const selectedPricing = currentSelectedPlan.pricing.find(
              p => p.duration_type === selectedDurationType
            );
            return selectedPricing?.price || 0;
          }
          return 0;
        })()}
        isLoading={isPurchasing}
      />
    </SafeAreaView>
  );
}

