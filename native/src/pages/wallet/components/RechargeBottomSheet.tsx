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
import CancelIcon from '../../../components/icons/CancelIcon';

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
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
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
          }}>
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={handleClose} />
        </Animated.View>

        {/* Floating Close Button */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 16,
            transform: [{ translateY }],
            zIndex: 30,
          }}>
          <TouchableOpacity
            onPress={handleClose}
            className="h-12 w-12 items-center justify-center rounded-full bg-white"
            style={{
              marginBottom: -56,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 4,
            }}>
            <CancelIcon size={24} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [{ translateY }],
          }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="rounded-t-3xl bg-white">
            <SafeAreaView edges={['bottom']}>
              <View className="pb-4 pt-3">
                {/* Drag Handle */}
                <View className="mb-6 h-1 w-10 self-center rounded-full bg-[#D1D5DB]" />

                {/* Content */}
                <ScrollView
                  className="px-5"
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled">
                  {/* Title */}
                  <Text
                    className="mb-2 font-bold text-xl text-[#111928]"
                    style={{ fontFamily: 'Inter-Bold' }}>
                    Recharge Wallet
                  </Text>
                  <Text
                    className="mb-6 text-sm text-[#6B7280]"
                    style={{
                      fontFamily: 'Inter-Regular',
                      ...(Platform.OS === 'android' && { includeFontPadding: false }),
                    }}>
                    Select or enter amount to add to your wallet
                  </Text>

                  {/* Quick Select */}
                  <Text
                    className="mb-3 font-medium text-sm text-[#374151]"
                    style={{ fontFamily: 'Inter-Medium' }}>
                    Quick Select
                  </Text>
                  <View className="mb-6 flex-row flex-wrap gap-3">
                    {QUICK_AMOUNTS.map((amount) => {
                      const isSelected = selectedAmount === amount;
                      return (
                        <TouchableOpacity
                          key={amount}
                          onPress={() => handleSelectQuickAmount(amount)}
                          className={`rounded-lg border px-4 py-2 ${
                            isSelected
                              ? 'border-[#055c3a] bg-[#055c3a]/10'
                              : 'border-[#E5E7EB] bg-[#F9FAFB]'
                          }`}
                          activeOpacity={0.7}
                          disabled={isProcessing || isLoading}>
                          <Text
                            className={`font-medium text-sm ${
                              isSelected ? 'text-[#055c3a]' : 'text-[#4B5563]'
                            }`}
                            style={{ fontFamily: 'Inter-Medium' }}>
                            ₹{amount}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Enter Amount */}
                  <Text
                    className="mb-3 font-medium text-sm text-[#374151]"
                    style={{ fontFamily: 'Inter-Medium' }}>
                    Enter Amount
                  </Text>
                  <View
                    className="mb-2 rounded-lg border border-[#E5E7EB]"
                    style={{ minHeight: 48 }}>
                    <View className="flex-row items-center px-4" style={{ minHeight: 48 }}>
                      <Text
                        className="mr-2 text-base text-[#111928]"
                        style={{
                          fontFamily: 'Inter-Regular',
                          lineHeight: Platform.OS === 'ios' ? 20 : 22,
                          ...(Platform.OS === 'android' && { includeFontPadding: false }),
                        }}>
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
                    <View className="mb-4 flex-row items-center">
                      <Text
                        className="text-xs text-[#DC2626]"
                        style={{
                          fontFamily: 'Inter-Regular',
                          ...(Platform.OS === 'android' && { includeFontPadding: false }),
                        }}>
                        Minimum ₹{MINIMUM_AMOUNT} is required
                      </Text>
                    </View>
                  )}

                  {/* Proceed Button */}
                  <View className="mb-12 mt-2">
                    <Button
                      label="Proceed to Payment"
                      onPress={handleRecharge}
                      isLoading={isProcessing || isLoading}
                      disabled={selectedAmount < MINIMUM_AMOUNT || isProcessing || isLoading}
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
