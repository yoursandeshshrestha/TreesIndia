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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import CancelIcon from '../../../components/icons/CancelIcon';
import {
  workerWithdrawalService,
  WorkerWithdrawalRequest,
} from '../../../services';

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

        {/* Floating Close Button */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 16,
            transform: [{ translateY }],
            zIndex: 30,
          }}
        >
          <TouchableOpacity
            onPress={handleClose}
            className="w-12 h-12 bg-white rounded-full items-center justify-center"
            style={{
              marginBottom: -56,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <CancelIcon size={24} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
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
                    Request Withdrawal
                  </Text>
                  <Text
                    className="text-sm text-[#6B7280] mb-6"
                    style={{
                      fontFamily: 'Inter-Regular',
                      ...(Platform.OS === 'android' && { includeFontPadding: false }),
                    }}
                  >
                    Funds will be transferred to your registered bank account
                  </Text>

                  {/* Available Balance Info */}
                  <View className="bg-[#F9FAFB] rounded-xl p-4 mb-6">
                    <Text
                      className="text-xs text-[#6B7280] mb-1"
                      style={{ fontFamily: 'Inter-Medium' }}
                    >
                      Available Balance
                    </Text>
                    <Text
                      className="text-2xl font-bold text-[#111928]"
                      style={{ fontFamily: 'Inter-Bold' }}
                    >
                      ₹{availableBalance.toLocaleString('en-IN')}
                    </Text>
                  </View>

                  {/* Amount Input */}
                  <View className="mb-4">
                    <Text
                      className="text-sm font-medium text-[#374151] mb-2"
                      style={{ fontFamily: 'Inter-Medium' }}
                    >
                      Withdrawal Amount
                    </Text>
                    <View
                      className={`border rounded-xl ${
                        amountError ? 'border-[#DC2626]' : 'border-[#E5E7EB]'
                      }`}
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
                        className="text-xs text-[#DC2626] mt-1"
                        style={{ fontFamily: 'Inter-Regular' }}
                      >
                        {amountError}
                      </Text>
                    )}
                  </View>

                  {/* Notes (Optional) */}
                  <View className="mb-4">
                    <Text
                      className="text-sm font-medium text-[#374151] mb-2"
                      style={{ fontFamily: 'Inter-Medium' }}
                    >
                      Notes (Optional)
                    </Text>
                    <View
                      className="border border-[#E5E7EB] rounded-xl"
                      style={{ minHeight: 80 }}
                    >
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
                  <View className="bg-[#F9FAFB] rounded-xl p-4 mb-6">
                    <Text
                      className="text-xs text-[#6B7280]"
                      style={{
                        fontFamily: 'Inter-Regular',
                        lineHeight: 16,
                      }}
                    >
                      Funds will be transferred to your registered bank account after admin approval. Make sure your bank details are up to date in your profile.
                    </Text>
                  </View>

                  {/* Submit Button */}
                  <View className="mt-2 mb-12">
                    <Button
                      label="Submit Request"
                      onPress={handleSubmit}
                      isLoading={isProcessing}
                      disabled={isProcessing}
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
