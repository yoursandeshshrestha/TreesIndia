import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { walletService, type WalletSummary, type WalletTransaction } from '../../services';
import { razorpayService } from '../../utils/razorpay';
import { useAppSelector } from '../../store/hooks';
import WalletBalanceCard from './components/WalletBalanceCard';
import TransactionItem from './components/TransactionItem';
import RechargeBottomSheet from './components/RechargeBottomSheet';
import BackIcon from '../../components/icons/BackIcon';

interface WalletScreenProps {
  onBack: () => void;
}

export default function WalletScreen({ onBack }: WalletScreenProps) {
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRechargeSheet, setShowRechargeSheet] = useState(false);
  const [isRecharging, setIsRecharging] = useState(false);

  const loadWalletData = useCallback(async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
        setCurrentPage(1);
        setHasMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Add timeout to prevent hanging (reduced to 10 seconds)
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout - please check your network connection and ensure the backend is running')), 10000)
      );

      const dataPromise = Promise.all([
        walletService.getWalletSummary(),
        walletService.getWalletTransactions(1, 10),
      ]);

      const [summaryData, transactionsData] = await Promise.race([
        dataPromise,
        timeoutPromise,
      ]);

      setWalletSummary(summaryData);
      setTransactions(transactionsData.transactions);
      setHasMore(transactionsData.pagination.page < transactionsData.pagination.total_pages);
      
      // Clear loading states immediately after setting data
      if (refresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Failed to load wallet data. Please try again.';
      setError(errorMessage);
      // Only show alert if not refreshing (to avoid spam)
      if (!refresh) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      // Ensure loading states are always cleared
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const loadMoreTransactions = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const transactionsData = await walletService.getWalletTransactions(
        nextPage,
        10
      );

      setTransactions((prev) => [...prev, ...transactionsData.transactions]);
      setCurrentPage(nextPage);
      setHasMore(
        transactionsData.pagination.page < transactionsData.pagination.total_pages
      );
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Failed to load more transactions. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore]);

  useEffect(() => {
    loadWalletData();
    // Initialize Razorpay when component mounts (non-blocking)
    razorpayService.initialize().catch(() => {
      // Razorpay initialization failed, will show error when trying to use it
    });
  }, [loadWalletData]);

  const handleRecharge = () => {
    setShowRechargeSheet(true);
  };

  const { user } = useAppSelector((state) => state.auth);

  const handleRechargeSubmit = async (amount: number) => {
    try {
      setIsRecharging(true);
      const rechargeResponse = await walletService.initiateRecharge({
        amount,
        payment_method: 'razorpay',
      });
      
      // Close the bottom sheet first
      setShowRechargeSheet(false);
      
      // Add a small delay to ensure the bottom sheet is fully closed
      // This prevents view hierarchy issues on iOS
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Check if Razorpay is available
      if (!razorpayService.isAvailable()) {
        Alert.alert(
          'Payment Gateway Unavailable',
          'Razorpay SDK is not available. Please ensure react-native-razorpay is installed and you are using a development build.',
          [{ text: 'OK' }]
        );
        setIsRecharging(false);
        return;
      }

      // Ensure Razorpay is initialized
      try {
        await razorpayService.initialize();
      } catch (error) {
        Alert.alert(
          'Payment Gateway Error',
          'Failed to initialize payment gateway. Please try again.',
          [{ text: 'OK' }]
        );
        setIsRecharging(false);
        return;
      }

      // Check if Razorpay is available
      if (!razorpayService.isAvailable()) {
        Alert.alert(
          'Payment Gateway Unavailable',
          'Razorpay SDK is not available. Please ensure react-native-razorpay is installed and you are using a development build.',
          [{ text: 'OK' }]
        );
        setIsRecharging(false);
        return;
      }

      // Get Razorpay key (you may want to get this from backend or env)
      const razorpayKey = razorpayService.getRazorpayKey();
      if (!razorpayKey) {
        Alert.alert(
          'Configuration Error',
          'Razorpay key is not configured. Please set EXPO_PUBLIC_DEV_RAZORPAY_APIKEY or EXPO_PUBLIC_PROD_RAZORPAY_APIKEY in your environment.',
          [{ text: 'OK' }]
        );
        setIsRecharging(false);
        return;
      }

      // Ensure order_id is a string (Razorpay requires string)
      const orderId = String(rechargeResponse.payment_order.id);
      
      // Open Razorpay checkout
      await razorpayService.openCheckout(
        {
          key: razorpayKey,
          amount: rechargeResponse.payment_order.amount, // Already in paise
          currency: rechargeResponse.payment_order.currency || 'INR',
          order_id: orderId,
          name: 'Trees India',
          description: 'Wallet Recharge',
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
          // Backend returns capital ID, so use ID or id (for compatibility)
          const paymentIdValue = rechargeResponse.payment.ID || rechargeResponse.payment.id;
          setIsRecharging(false);
          try {
            // Use the payment ID from the backend response
            // Ensure it's a valid number
            const paymentId = Number(paymentIdValue);
            
            if (!paymentId || isNaN(paymentId) || paymentId <= 0) {
              throw new Error(`Invalid payment ID: ${paymentIdValue}`);
            }
            
            await walletService.completeRecharge(
              paymentId,
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            Alert.alert(
              'Payment Successful',
              `Your wallet has been recharged with ₹${amount.toFixed(2)}.`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // Reload wallet data to show updated balance
                    loadWalletData(true);
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
          // If payment was cancelled, user already knows, no need to show alert
          setIsRecharging(false);
        }
      );
      
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Failed to initiate recharge. Please try again.';
      Alert.alert('Error', errorMessage);
      setIsRecharging(false);
    }
  };

  const handleCompletePayment = async (transaction: WalletTransaction) => {
    if (!transaction.razorpay_order_id) {
      Alert.alert('Error', 'Payment order not found for this transaction.');
      return;
    }

    if (!razorpayService.isAvailable()) {
      Alert.alert(
        'Payment Gateway Unavailable',
        'Razorpay SDK is not available. Please ensure react-native-razorpay is installed.',
        [{ text: 'OK' }]
      );
      return;
    }

    const razorpayKey = razorpayService.getRazorpayKey();
    if (!razorpayKey) {
      Alert.alert(
        'Configuration Error',
        'Razorpay key is not configured.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Open Razorpay checkout for pending payment
    await razorpayService.openCheckout(
      {
        key: razorpayKey,
        amount: Math.round(transaction.amount * 100), // Convert to paise
        currency: 'INR',
        order_id: transaction.razorpay_order_id,
        name: 'Trees India',
        description: 'Complete Wallet Recharge Payment',
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
          await walletService.completeRecharge(
            transaction.id,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );

          Alert.alert(
            'Payment Successful',
            `Your wallet has been recharged with ₹${transaction.amount.toFixed(2)}.`,
            [
              {
                text: 'OK',
                onPress: () => {
                  loadWalletData(true);
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
        }
      },
      (error) => {
        // Payment failed or cancelled
        if (error.code !== 'PAYMENT_CANCELLED') {
          Alert.alert(
            'Payment Failed',
            error.description || 'Payment could not be processed. Please try again.',
            [{ text: 'OK' }]
          );
        }
      }
    );
  };

  const handleRefresh = () => {
    loadWalletData(true);
  };

  const handleRetry = () => {
    loadWalletData();
  };

  // Only show loading screen if we don't have data yet
  if (isLoading && !isRefreshing && !walletSummary) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#055c3a" />
          <Text
            className="text-base text-[#6B7280] mt-4"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            Loading wallet...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !walletSummary) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 border-b border-[#E5E7EB]">
          <TouchableOpacity
            onPress={onBack}
            className="mr-4 p-2 -ml-2"
            activeOpacity={0.7}
          >
            <BackIcon size={24} color="#111928" />
          </TouchableOpacity>
          <Text
            className="text-xl font-semibold text-[#111928] flex-1"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            My Wallet
          </Text>
        </View>

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
          <TouchableOpacity
            onPress={handleRetry}
            className="px-6 py-3 rounded-lg bg-[#055c3a]"
            activeOpacity={0.8}
          >
            <Text
              className="text-base font-medium text-white"
              style={{ fontFamily: 'Inter-Medium' }}
            >
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-[#E5E7EB]">
        <TouchableOpacity
          onPress={onBack}
          className="mr-4 p-2 -ml-2"
          activeOpacity={0.7}
        >
          <BackIcon size={24} color="#111928" />
        </TouchableOpacity>
        <Text
          className="text-xl font-semibold text-[#111928] flex-1"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          My Wallet
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#055c3a"
            colors={['#055c3a']}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
          ) {
            loadMoreTransactions();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Wallet Balance Section */}
        {walletSummary && (
          <View className="px-6 py-4">
            <WalletBalanceCard
              walletSummary={walletSummary}
              onRecharge={handleRecharge}
            />
          </View>
        )}

        {/* Separator */}
        <View className="h-2 bg-[#F5F5F5]" />

        {/* Transactions Header */}
        <View className="px-6 py-4">
          <Text
            className="text-base font-semibold text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            Recent Transactions
          </Text>
        </View>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <View className="items-center justify-center py-12 px-6">
            <Text
              className="text-lg font-semibold text-[#4B5563] mb-2"
              style={{ fontFamily: 'Inter-SemiBold' }}
            >
              No Transactions Yet
            </Text>
            <Text
              className="text-sm text-[#6B7280] text-center"
              style={{ fontFamily: 'Inter-Regular' }}
            >
              Your transaction history will appear here
            </Text>
          </View>
        ) : (
          <View className="px-6 pb-6">
            {transactions.map((transaction, index) => {
              // Use ID (capital) or id (lowercase) or index as fallback
              const transactionKey = (transaction as any).ID || transaction.id || `transaction-${index}`;
              return (
                <View key={transactionKey}>
                  <TransactionItem
                    transaction={transaction}
                    onCompletePayment={handleCompletePayment}
                  />
                  {index < transactions.length - 1 && (
                    <View className="h-px bg-[#F3F4F6]" />
                  )}
                </View>
              );
            })}
            {isLoadingMore && (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#055c3a" />
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Recharge Bottom Sheet */}
      <RechargeBottomSheet
        visible={showRechargeSheet}
        onClose={() => {
          if (!isRecharging) {
            setShowRechargeSheet(false);
          }
        }}
        onRecharge={handleRechargeSubmit}
        isLoading={isRecharging}
      />
    </SafeAreaView>
  );
}

