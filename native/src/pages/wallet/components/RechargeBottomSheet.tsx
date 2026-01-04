import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';

interface RechargeBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onRecharge: (amount: number) => Promise<void>;
  isLoading?: boolean;
}

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];
const MINIMUM_AMOUNT = 100;

export default function RechargeBottomSheet({
  visible,
  onClose,
  onRecharge,
  isLoading = false,
}: RechargeBottomSheetProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [manualAmount, setManualAmount] = useState<string>('');
  const [showMinimumError, setShowMinimumError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
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

  const handleSelectQuickAmount = (amount: number) => {
    setSelectedAmount(amount);
    setManualAmount(amount.toString());
    setShowMinimumError(false);
  };

  const handleAmountChange = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    setManualAmount(numericValue);

    const amount = parseFloat(numericValue) || 0;
    setSelectedAmount(amount);
    setShowMinimumError(numericValue.length > 0 && amount > 0 && amount < MINIMUM_AMOUNT);
  };

  const handleRecharge = async () => {
    if (selectedAmount < MINIMUM_AMOUNT) {
      setShowMinimumError(true);
      return;
    }

    setIsProcessing(true);
    try {
      await onRecharge(selectedAmount);
      // Reset form on success
      setSelectedAmount(0);
      setManualAmount('');
      setShowMinimumError(false);
    } catch {
      // Error handling is done in parent component
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing && !isLoading && !isClosing) {
      setIsClosing(true);
      setSelectedAmount(0);
      setManualAmount('');
      setShowMinimumError(false);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end">
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
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [{ translateY }],
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="bg-white rounded-t-3xl"
          >
            <SafeAreaView edges={['bottom']}>
              <View className="pt-3 pb-4">
                {/* Drag Handle */}
                <View className="self-center w-10 h-1 bg-[#D1D5DB] rounded-full mb-6" />

                {/* Content */}
                <ScrollView
                  className="px-5"
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Title */}
                  <Text
                    className="text-xl font-bold text-[#111928] mb-2"
                    style={{ fontFamily: 'Inter-Bold' }}
                  >
                    Recharge Wallet
                  </Text>
                  <Text
                    className="text-sm text-[#6B7280] mb-6"
                    style={{
                      fontFamily: 'Inter-Regular',
                      ...(Platform.OS === 'android' && { includeFontPadding: false }),
                    }}
                  >
                    Select or enter amount to add to your wallet
                  </Text>

                  {/* Quick Select */}
                  <Text
                    className="text-sm font-medium text-[#374151] mb-3"
                    style={{ fontFamily: 'Inter-Medium' }}
                  >
                    Quick Select
                  </Text>
                  <View className="flex-row flex-wrap gap-3 mb-6">
                    {QUICK_AMOUNTS.map((amount) => {
                      const isSelected = selectedAmount === amount;
                      return (
                        <TouchableOpacity
                          key={amount}
                          onPress={() => handleSelectQuickAmount(amount)}
                          className={`px-4 py-2 rounded-lg border ${
                            isSelected
                              ? 'bg-[#055c3a]/10 border-[#055c3a]'
                              : 'bg-[#F9FAFB] border-[#E5E7EB]'
                          }`}
                          activeOpacity={0.7}
                          disabled={isProcessing || isLoading}
                        >
                          <Text
                            className={`text-sm font-medium ${
                              isSelected ? 'text-[#055c3a]' : 'text-[#4B5563]'
                            }`}
                            style={{ fontFamily: 'Inter-Medium' }}
                          >
                            ₹{amount}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Enter Amount */}
                  <Text
                    className="text-sm font-medium text-[#374151] mb-3"
                    style={{ fontFamily: 'Inter-Medium' }}
                  >
                    Enter Amount
                  </Text>
                  <View
                    className="border border-[#E5E7EB] rounded-lg mb-2"
                    style={{ minHeight: 48 }}
                  >
                    <View className="flex-row items-center px-4" style={{ minHeight: 48 }}>
                      <Text
                        className="text-base text-[#111928] mr-2"
                        style={{
                          fontFamily: 'Inter-Regular',
                          lineHeight: Platform.OS === 'ios' ? 20 : 22,
                          ...(Platform.OS === 'android' && { includeFontPadding: false }),
                        }}
                      >
                        ₹
                      </Text>
                      <TextInput
                        value={manualAmount}
                        onChangeText={handleAmountChange}
                        placeholder="Enter amount"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        editable={!isProcessing && !isLoading}
                        className="flex-1 text-base text-[#111928]"
                        style={{
                          fontFamily: 'Inter-Regular',
                          paddingVertical: 0,
                          margin: 0,
                          fontSize: 16,
                          lineHeight: Platform.OS === 'ios' ? 20 : 22,
                          textAlignVertical: 'center',
                          ...(Platform.OS === 'android' && { includeFontPadding: false }),
                        }}
                      />
                    </View>
                  </View>

                  {/* Minimum Error */}
                  {showMinimumError && (
                    <View className="flex-row items-center mb-4">
                      <Text
                        className="text-xs text-[#DC2626]"
                        style={{
                          fontFamily: 'Inter-Regular',
                          ...(Platform.OS === 'android' && { includeFontPadding: false }),
                        }}
                      >
                        Minimum ₹{MINIMUM_AMOUNT} is required
                      </Text>
                    </View>
                  )}

                  {/* Proceed Button */}
                  <View className="mt-2 mb-12">
                    <Button
                      label="Proceed to Payment"
                      onPress={handleRecharge}
                      isLoading={isProcessing || isLoading}
                      disabled={
                        selectedAmount < MINIMUM_AMOUNT ||
                        isProcessing ||
                        isLoading
                      }
                    />
                  </View>
                </ScrollView>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

