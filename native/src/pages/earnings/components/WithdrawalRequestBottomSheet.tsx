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
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import CancelIcon from '../../../components/icons/CancelIcon';
import { workerWithdrawalService, WorkerWithdrawalRequest } from '../../../services';

interface WithdrawalRequestBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  availableBalance: number;
  onSuccess: () => void;
}

export default function WithdrawalRequestBottomSheet({
  visible,
  onClose,
  availableBalance,
  onSuccess,
}: WithdrawalRequestBottomSheetProps) {
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [amountError, setAmountError] = useState<string>('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const validateAmount = (): boolean => {
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setAmountError('Please enter a valid amount');
      return false;
    }
    if (amountNum > availableBalance) {
      setAmountError(`Amount cannot exceed ₹${availableBalance.toLocaleString('en-IN')}`);
      return false;
    }
    setAmountError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateAmount()) {
      return;
    }

    setIsProcessing(true);
    try {
      const request: WorkerWithdrawalRequest = {
        amount: parseFloat(amount),
        notes: notes.trim() || undefined,
      };

      await workerWithdrawalService.requestWithdrawal(request);

      Alert.alert(
        'Success',
        'Withdrawal request submitted successfully. Admin will review and process your request.',
        [
          {
            text: 'OK',
            onPress: () => {
              handleClose();
              onSuccess();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to submit withdrawal request'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setAmount('');
      setNotes('');
      setAmountError('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <View className="flex-1">
          {/* Overlay */}
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              opacity: overlayOpacity,
            }}>
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
              zIndex: 30,
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
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: '70%',
              backgroundColor: 'white',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              transform: [{ translateY }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
              overflow: 'hidden',
            }}>
            <View className="flex-1 bg-white">
              {/* Header */}
              <View className="flex-row items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
                <View className="flex-1">
                  <Text
                    className="font-bold text-lg text-[#111928]"
                    style={{ fontFamily: 'Inter-Bold' }}>
                    Request Withdrawal
                  </Text>
                  <Text
                    className="mt-1 text-sm text-[#6B7280]"
                    style={{
                      fontFamily: 'Inter-Regular',
                      ...(Platform.OS === 'android' && { includeFontPadding: false }),
                    }}>
                    Funds will be transferred to your bank account
                  </Text>
                </View>
              </View>

              {/* Content - Scrollable */}
              <ScrollView
                contentContainerStyle={{
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                  paddingBottom: 20,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                {/* Available Balance Info */}
                <View className="mb-6 rounded-xl bg-[#F9FAFB] p-4">
                  <Text
                    className="mb-1 text-xs text-[#6B7280]"
                    style={{ fontFamily: 'Inter-Medium' }}>
                    Available Balance
                  </Text>
                  <Text
                    className="font-bold text-2xl text-[#111928]"
                    style={{ fontFamily: 'Inter-Bold' }}>
                    ₹{availableBalance.toLocaleString('en-IN')}
                  </Text>
                </View>

                {/* Amount Input */}
                <View className="mb-4">
                  <Text
                    className="mb-2 font-medium text-sm text-[#374151]"
                    style={{ fontFamily: 'Inter-Medium' }}>
                    Withdrawal Amount
                  </Text>
                  <View
                    className={`rounded-xl border ${
                      amountError ? 'border-[#DC2626]' : 'border-[#E5E7EB]'
                    }`}
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
                        value={amount}
                        onChangeText={(text) => {
                          setAmount(text);
                          if (amountError) {
                            setAmountError('');
                          }
                        }}
                        placeholder="Enter amount"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        editable={!isProcessing}
                        maxLength={10}
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
                  {amountError && (
                    <Text
                      className="mt-1 text-xs text-[#DC2626]"
                      style={{ fontFamily: 'Inter-Regular' }}>
                      {amountError}
                    </Text>
                  )}
                </View>

                {/* Notes (Optional) */}
                <View className="mb-4">
                  <Text
                    className="mb-2 font-medium text-sm text-[#374151]"
                    style={{ fontFamily: 'Inter-Medium' }}>
                    Notes (Optional)
                  </Text>
                  <View className="rounded-xl border border-[#E5E7EB]" style={{ minHeight: 80 }}>
                    <TextInput
                      value={notes}
                      onChangeText={setNotes}
                      placeholder="Add any additional notes..."
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={3}
                      editable={!isProcessing}
                      maxLength={500}
                      className="px-4 py-3 text-base text-[#111928]"
                      style={{
                        fontFamily: 'Inter-Regular',
                        minHeight: 80,
                        fontSize: 16,
                        textAlignVertical: 'top',
                        ...(Platform.OS === 'android' && { includeFontPadding: false }),
                      }}
                    />
                  </View>
                </View>

                {/* Info Note */}
                <View className="rounded-xl bg-[#F9FAFB] p-4">
                  <Text
                    className="text-xs text-[#6B7280]"
                    style={{
                      fontFamily: 'Inter-Regular',
                      lineHeight: 16,
                    }}>
                    Funds will be transferred to your registered bank account after admin approval.
                    Make sure your bank details are up to date in your profile.
                  </Text>
                </View>
              </ScrollView>

              {/* Action Button - Sticky at bottom */}
              <SafeAreaView edges={['bottom']} style={{ backgroundColor: 'white' }}>
                <View
                  className={`bg-white pt-4 ${keyboardHeight > 0 ? 'pb-4' : 'pb-10'}`}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 8,
                  }}>
                  <View className="px-5">
                    <Button
                      label="Submit Request"
                      onPress={handleSubmit}
                      isLoading={isProcessing}
                      disabled={isProcessing}
                    />
                  </View>
                </View>
              </SafeAreaView>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
