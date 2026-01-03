import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { subscriptionService, type UserSubscription, type SubscriptionHistory } from '../../services';
import Button from '../../components/ui/Button';
import BackIcon from '../../components/icons/BackIcon';
import ActiveSubscriptionCard from './components/ActiveSubscriptionCard';
import EmptySubscriptionState from './components/EmptySubscriptionState';
import BillingHistoryCard from './components/BillingHistoryCard';

interface SubscriptionScreenProps {
  onBack: () => void;
  onNavigateToPlans?: () => void;
}

export default function SubscriptionScreen({ onBack, onNavigateToPlans }: SubscriptionScreenProps) {
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubscriptionData = useCallback(async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const [subscription, history] = await Promise.all([
        subscriptionService.getMySubscription(),
        subscriptionService.getSubscriptionHistory(),
      ]);

      setCurrentSubscription(subscription);
      setSubscriptionHistory(history);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load subscription data. Please try again.';
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
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  const handleRefresh = () => {
    loadSubscriptionData(true);
  };

  const handleBuySubscription = () => {
    if (onNavigateToPlans) {
      onNavigateToPlans();
    }
  };

  const isSubscriptionActive = (subscription: UserSubscription | null): boolean => {
    if (!subscription) return false;
    if (subscription.status !== 'active') return false;
    
    const endDate = new Date(subscription.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return endDate >= today;
  };

  const renderContent = () => {
    if (isLoading && !isRefreshing) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#055c3a" />
          <Text
            className="text-sm text-[#6B7280] mt-4"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            Loading subscription data...
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
            Something went wrong
          </Text>
          <Text
            className="text-sm text-[#6B7280] text-center mb-6"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            {error}
          </Text>
          <Button
            label="Try Again"
            onPress={() => loadSubscriptionData()}
            variant="solid"
          />
        </View>
      );
    }

    const hasActiveSubscription = isSubscriptionActive(currentSubscription);

    return (
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#055c3a"
          />
        }
      >
        <View className="px-6 py-4">
          {/* Active Subscription Section */}
          {hasActiveSubscription && currentSubscription ? (
            <View>
              <ActiveSubscriptionCard subscription={currentSubscription} />
              <View className="h-6" />
            </View>
          ) : (
            <View>
              <EmptySubscriptionState />
              <View className="h-6" />
            </View>
          )}

          {/* Buy Subscription Button */}
          {!hasActiveSubscription && (
            <View>
              <Button
                label="Buy Subscription"
                onPress={handleBuySubscription}
                variant="solid"
              />
              <View className="h-6" />
            </View>
          )}

          {/* Billing History Section */}
          {subscriptionHistory.length > 0 && (
            <View>
              <Text
                className="text-lg font-bold text-[#111928] mb-4"
                style={{ fontFamily: 'Inter-Bold' }}
              >
                Billing History
              </Text>
              {subscriptionHistory.map((subscription, index) => (
                <View key={subscription.id}>
                  <BillingHistoryCard subscription={subscription} />
                  {index < subscriptionHistory.length - 1 && (
                    <View className="h-4" />
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Bottom spacing for refresh */}
          <View className="h-8" />
        </View>
      </ScrollView>
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
          My Subscription
        </Text>
      </View>

      {/* Content */}
      {renderContent()}
    </SafeAreaView>
  );
}

