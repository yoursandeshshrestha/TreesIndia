import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Alert, Platform, Image, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WalletIcon from '../../../components/icons/WalletIcon';

interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMethod: (method: 'wallet' | 'razorpay') => void;
  walletBalance: number;
  amount: number;
  isLoading?: boolean;
}

export default function PaymentMethodModal({
  visible,
  onClose,
  onSelectMethod,
  walletBalance,
  amount,
  isLoading = false,
}: PaymentMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'razorpay' | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;
  const canUseWallet = walletBalance >= amount;

  useEffect(() => {
    if (visible) {
      setSelectedMethod(null);
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 500,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      setIsClosing(false);
    });
  };

  const handleSelectWallet = () => {
    if (!canUseWallet) {
      Alert.alert(
        'Insufficient Balance',
        `Your wallet balance (₹${(walletBalance || 0).toLocaleString('en-IN')}) is less than the required amount (₹${(amount || 0).toLocaleString('en-IN')}). Please recharge your wallet or use Razorpay.`,
        [{ text: 'OK' }]
      );
      return;
    }
    setSelectedMethod('wallet');
    onSelectMethod('wallet');
  };

  const handleSelectRazorpay = () => {
    setSelectedMethod('razorpay');
    onSelectMethod('razorpay');
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1">
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: overlayOpacity,
          }}
        >
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '90%',
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [{ translateY }],
          }}
        >
          <SafeAreaView edges={['bottom']} className="flex-1">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-[#E5E7EB]">
              <Text
                className="text-xl font-semibold text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                Select Payment Method
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                className="p-2"
                activeOpacity={0.7}
              >
                <Text className="text-2xl text-[#4B5563]">×</Text>
              </TouchableOpacity>
            </View>

            <View className="px-6 pt-6 pb-12">
              {/* Amount */}
              <View className="mb-6">
                <Text
                  className="text-sm text-[#6B7280] mb-1"
                  style={{ fontFamily: 'Inter-Regular' }}
                >
                  Amount to pay
                </Text>
                <Text
                  className="text-2xl font-bold text-[#111928]"
                  style={{ fontFamily: 'Inter-Bold' }}
                >
                  ₹{(amount || 0).toLocaleString('en-IN')}
                </Text>
              </View>

              {/* Wallet Option */}
              <TouchableOpacity
                onPress={handleSelectWallet}
                disabled={isLoading || !canUseWallet}
                className={`flex-row items-center p-4 rounded-lg border mb-3 ${
                  selectedMethod === 'wallet'
                    ? 'border-[#055c3a] bg-[#F0FDF4]'
                    : canUseWallet
                    ? 'border-[#E5E7EB] bg-white'
                    : 'border-[#E5E7EB] bg-[#F9FAFB] opacity-60'
                }`}
                activeOpacity={0.5}
              >
                <View className="w-12 h-12 bg-[#055c3a] rounded-full items-center justify-center mr-4">
                  <WalletIcon size={24} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold text-[#111928] mb-1"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    Wallet
                  </Text>
                  <Text
                    className="text-sm text-[#4B5563]"
                    style={{ fontFamily: 'Inter-Regular' }}
                  >
                    Balance: ₹{(walletBalance || 0).toLocaleString('en-IN')}
                  </Text>
                  {!canUseWallet && (
                    <Text
                      className="text-xs text-[#B3261E] mt-1"
                      style={{ fontFamily: 'Inter-Regular' }}
                    >
                      Insufficient balance
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* Razorpay Option */}
              <TouchableOpacity
                onPress={handleSelectRazorpay}
                disabled={isLoading}
                className={`flex-row items-center p-4 rounded-lg border ${
                  selectedMethod === 'razorpay'
                    ? 'border-[#055c3a] bg-[#F0FDF4]'
                    : 'border-[#E5E7EB] bg-white'
                }`}
                activeOpacity={0.5}
              >
                <View className="w-12 h-12 bg-white rounded-lg items-center justify-center mr-4 border border-[#E5E7EB]">
                  <Image
                    source={require('../../../../assets/icons/common/razorpay.png')}
                    style={{ width: 32, height: 32 }}
                    resizeMode="contain"
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold text-[#111928] mb-1"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    Razorpay
                  </Text>
                  <Text
                    className="text-sm text-[#4B5563]"
                    style={{ fontFamily: 'Inter-Regular' }}
                  >
                    Pay via UPI, Cards, Net Banking
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

