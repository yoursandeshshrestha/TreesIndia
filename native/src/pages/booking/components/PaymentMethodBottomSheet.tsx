import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WalletIcon from '../../../components/icons/WalletIcon';

interface PaymentMethodBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectMethod: (method: 'razorpay' | 'wallet') => Promise<void>;
  selectedMethod?: 'razorpay' | 'wallet';
  amount: number;
  walletBalance: number;
}

export default function PaymentMethodBottomSheet({
  visible,
  onClose,
  onSelectMethod,
  selectedMethod: initialMethod,
  amount,
  walletBalance,
}: PaymentMethodBottomSheetProps) {
  const [selectedMethod, setSelectedMethod] = useState<'razorpay' | 'wallet' | null>(
    initialMethod || null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;

  const isWalletDisabled = walletBalance < amount;

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

  useEffect(() => {
    setSelectedMethod(initialMethod || null);
  }, [initialMethod]);

  const handleClose = () => {
    if (isClosing || isProcessing) return;
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

  const handleSelectMethod = async (method: 'razorpay' | 'wallet') => {
    if (method === 'wallet' && isWalletDisabled) return;

    setSelectedMethod(method);
    setIsProcessing(true);

    try {
      await onSelectMethod(method);
      // Note: Don't close here - let the parent handle closing after successful payment
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View className="flex-1">
        {/* Overlay */}
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: overlayOpacity,
          }}
        >
          <TouchableOpacity className="flex-1" onPress={handleClose} activeOpacity={1} disabled={isProcessing} />
        </Animated.View>

        {/* Bottom Sheet */}
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
          <SafeAreaView edges={['bottom']}>
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
                disabled={isProcessing}
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
                onPress={() => handleSelectMethod('wallet')}
                disabled={isProcessing || isWalletDisabled}
                className={`flex-row items-center p-4 rounded-lg border mb-3 ${
                  selectedMethod === 'wallet'
                    ? 'border-[#055c3a] bg-[#F0FDF4]'
                    : isWalletDisabled
                    ? 'border-[#E5E7EB] bg-[#F9FAFB] opacity-60'
                    : 'border-[#E5E7EB] bg-white'
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
                  {isWalletDisabled && (
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
                onPress={() => handleSelectMethod('razorpay')}
                disabled={isProcessing}
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

            {/* Processing Overlay */}
            {isProcessing && (
              <View
                className="absolute inset-0 bg-black/20 items-center justify-center"
                style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
              >
                <View className="bg-white p-8 rounded-2xl items-center">
                  <ActivityIndicator size="large" color="#055c3a" />
                  <Text
                    className="text-[#111928] mt-4 text-lg font-semibold"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    Processing
                  </Text>
                  <Text
                    className="text-[#6B7280] mt-2 text-center"
                    style={{ fontFamily: 'Inter-Regular' }}
                  >
                    Please wait...
                  </Text>
                </View>
              </View>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
