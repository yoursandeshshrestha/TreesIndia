import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WalletIcon from '../../../components/icons/WalletIcon';
import CancelIcon from '../../../components/icons/CancelIcon';

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

  const slideAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const isWalletDisabled = walletBalance < amount;

  useEffect(() => {
    if (visible) {
      setSelectedMethod(null);
      setIsProcessing(false); // Reset processing state when sheet opens

      // Animate in
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, overlayOpacity, slideAnim]);

  useEffect(() => {
    setSelectedMethod(initialMethod || null);
  }, [initialMethod]);

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  const handleSelectMethod = async (method: 'razorpay' | 'wallet') => {
    if (method === 'wallet' && isWalletDisabled) return;

    setSelectedMethod(method);
    setIsProcessing(true);

    try {
      await onSelectMethod(method);
      // Note: Don't close here - let the parent handle closing after successful payment
    } catch (error) {
      setIsProcessing(false);
    }
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent>
      <View className="flex-1">
        {/* Overlay */}
        <Animated.View
          style={{
            opacity: overlayOpacity,
          }}
          className="absolute inset-0 bg-black/50">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={handleClose}
            disabled={isProcessing}
          />
        </Animated.View>

        {/* Floating Close Button */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: '70%',
            right: 16,
            transform: [{ translateY }],
            zIndex: 60,
          }}>
          <TouchableOpacity
            onPress={handleClose}
            disabled={isProcessing}
            className="h-12 w-12 items-center justify-center rounded-full bg-white"
            style={{
              marginTop: -56,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 4,
            }}>
            <CancelIcon size={24} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={{
            transform: [{ translateY }],
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
          className="absolute bottom-0 left-0 right-0 max-h-[70%] min-h-[70%] rounded-t-3xl bg-white">
          {/* Header - Fixed */}
          <View className="flex-row items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
            <Text
              className="font-semibold text-lg text-[#111928]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Select Payment Method
            </Text>
          </View>

          {/* Content - Scrollable */}
          <View style={{ flex: 1 }} className="px-6 pb-6 pt-6">
            {/* Amount */}
            <View className="mb-6">
              <Text className="mb-1 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                Amount to pay
              </Text>
              <Text
                className="font-bold text-2xl text-[#111928]"
                style={{ fontFamily: 'Inter-Bold' }}>
                ₹{(amount || 0).toLocaleString('en-IN')}
              </Text>
            </View>

            {/* Wallet Option */}
            <TouchableOpacity
              onPress={() => handleSelectMethod('wallet')}
              disabled={isProcessing || isWalletDisabled}
              className={`mb-3 flex-row items-center rounded-lg border p-4 ${
                selectedMethod === 'wallet'
                  ? 'border-[#055c3a] bg-[#F0FDF4]'
                  : isWalletDisabled
                    ? 'border-[#E5E7EB] bg-[#F9FAFB] opacity-60'
                    : 'border-[#E5E7EB] bg-white'
              }`}
              activeOpacity={0.5}>
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-[#055c3a]">
                <WalletIcon size={24} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text
                  className="mb-1 font-semibold text-base text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  Wallet
                </Text>
                <Text className="text-sm text-[#4B5563]" style={{ fontFamily: 'Inter-Regular' }}>
                  Balance: ₹{(walletBalance || 0).toLocaleString('en-IN')}
                </Text>
                {isWalletDisabled && (
                  <Text
                    className="mt-1 text-xs text-[#B3261E]"
                    style={{ fontFamily: 'Inter-Regular' }}>
                    Insufficient balance
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Razorpay Option */}
            <TouchableOpacity
              onPress={() => handleSelectMethod('razorpay')}
              disabled={isProcessing}
              className={`flex-row items-center rounded-lg border p-4 ${
                selectedMethod === 'razorpay'
                  ? 'border-[#055c3a] bg-[#F0FDF4]'
                  : 'border-[#E5E7EB] bg-white'
              }`}
              activeOpacity={0.5}>
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white">
                <Image
                  source={require('../../../../assets/icons/common/razorpay.png')}
                  style={{ width: 32, height: 32 }}
                  resizeMode="contain"
                />
              </View>
              <View className="flex-1">
                <Text
                  className="mb-1 font-semibold text-base text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  Razorpay
                </Text>
                <Text className="text-sm text-[#4B5563]" style={{ fontFamily: 'Inter-Regular' }}>
                  Pay via UPI, Cards, Net Banking
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Processing Overlay */}
          {isProcessing && (
            <View
              className="absolute inset-0 items-center justify-center bg-black/20"
              style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
              <View className="items-center rounded-2xl bg-white p-8">
                <ActivityIndicator size="large" color="#055c3a" />
                <Text
                  className="mt-4 font-semibold text-lg text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  Processing
                </Text>
                <Text
                  className="mt-2 text-center text-[#6B7280]"
                  style={{ fontFamily: 'Inter-Regular' }}>
                  Please wait...
                </Text>
              </View>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}
