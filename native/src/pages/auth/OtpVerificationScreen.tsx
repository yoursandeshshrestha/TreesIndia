import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { verifyOTP } from '../../store/slices/authSlice';
import Button from '../../components/ui/Button';

interface OtpVerificationScreenProps {
  phoneNumber: string;
  onBack?: () => void;
}

export default function OtpVerificationScreen({
  phoneNumber,
  onBack,
}: OtpVerificationScreenProps) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [otp, setOtp] = useState('');
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleVerifyOtp = useCallback(async () => {
    if (otp.length !== 6 || isLoading) {
      return;
    }

    try {
      const result = await dispatch(verifyOTP({ phone: phoneNumber, otp }));
      if (verifyOTP.fulfilled.match(result)) {
        // Navigation will be handled by App.tsx based on auth state
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
    }
  }, [otp, phoneNumber, dispatch, isLoading]);

  // Auto-focus first input on mount
  useEffect(() => {
    // Small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const formatPhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace('+', '');
    if (cleanPhone.startsWith('91') && cleanPhone.length >= 12) {
      const mainNumber = cleanPhone.substring(2);
      return `+91 ${mainNumber.substring(0, 5)} ${mainNumber.substring(5)}`;
    }
    return phone;
  };

  const handleOtpChange = (text: string, index: number) => {
    const numericText = text.replace(/\D/g, '');

    if (numericText.length > 1) {
      // Handle paste - fill all inputs from current index
      const pastedOtp = numericText.substring(0, 6).split('');
      const newInputs = [...otpInputs];
      pastedOtp.forEach((char, i) => {
        if (index + i < 6) {
          newInputs[index + i] = char;
        }
      });
      setOtpInputs(newInputs);
      const newOtp = newInputs.join('');
      setOtp(newOtp);

      // Focus the next empty input after pasted content, or last input if all filled
      const nextEmptyIndex = newInputs.findIndex((val, idx) => idx >= index && val === '');
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(index + pastedOtp.length - 1, 5);
      if (focusIndex < 6 && focusIndex >= 0) {
        setTimeout(() => {
          inputRefs.current[focusIndex]?.focus();
        }, 50);
      } else if (newOtp.length === 6) {
        // All inputs filled, blur the keyboard
        setTimeout(() => {
          inputRefs.current[5]?.blur();
        }, 50);
      }
    } else {
      const newInputs = [...otpInputs];
      newInputs[index] = numericText;
      setOtpInputs(newInputs);
      const newOtp = newInputs.join('');
      setOtp(newOtp);

      // Auto-focus next input when digit is entered
      if (numericText && index < 5) {
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 50);
      } else if (numericText && index === 5) {
        // Last input filled, blur the keyboard
        setTimeout(() => {
          inputRefs.current[5]?.blur();
        }, 50);
      }
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace') {
      if (otpInputs[index]) {
        // If current input has value, clear it
        const newInputs = [...otpInputs];
        newInputs[index] = '';
        setOtpInputs(newInputs);
        setOtp(newInputs.join(''));
      } else if (index > 0) {
        // If current input is empty, go to previous and clear it
        const newInputs = [...otpInputs];
        newInputs[index - 1] = '';
        setOtpInputs(newInputs);
        setOtp(newInputs.join(''));
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus();
        }, 50);
      }
    }
  };

  const isOtpComplete = otp.length === 6;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-8">
            {/* Back Button */}
            {onBack && (
              <TouchableOpacity
                onPress={onBack}
                className="mb-8"
                activeOpacity={0.7}
              >
                <Text
                  className="text-base text-[#1C1C1C]"
                  style={{
                    lineHeight: 24,
                    ...(Platform.OS === 'android' && { includeFontPadding: false }),
                  }}
                >
                  ← Back
                </Text>
              </TouchableOpacity>
            )}

            {/* Title */}
            <Text
              className="text-2xl font-bold text-[#1C1C1C] mb-2"
              style={{
                lineHeight: 32,
                ...(Platform.OS === 'android' && { includeFontPadding: false }),
              }}
            >
              Verify OTP
            </Text>

            {/* Subtitle */}
            <Text
              className="text-base text-[#6B7280] mb-8"
              style={{
                lineHeight: 24,
                ...(Platform.OS === 'android' && { includeFontPadding: false }),
              }}
            >
              Enter the code sent to {formatPhoneNumber(phoneNumber)}
            </Text>

            {/* OTP Input Fields */}
            <View className="flex-row justify-between mb-4 px-2">
              {otpInputs.map((value, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  value={value}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  editable={!isLoading}
                  selectTextOnFocus
                  className={`text-center border border-[#E5E7EB] rounded-md ${
                    value ? 'bg-[#F3F4F6]' : 'bg-white'
                  }`}
                  style={{
                    width: 48,
                    height: 56,
                    fontSize: 24,
                    color: '#1C1C1C',
                    paddingVertical: 0,
                    ...(Platform.OS === 'android' && {
                      includeFontPadding: false,
                      textAlignVertical: 'center',
                    }),
                  }}
                />
              ))}
            </View>

            {/* Error Message */}
            {error && (
              <Text
                className="text-sm text-[#DC2626] mb-4"
                style={{
                  lineHeight: 20,
                  ...(Platform.OS === 'android' && { includeFontPadding: false }),
                }}
              >
                {error}
              </Text>
            )}

            {/* Resend Code */}
            <View className="flex-row items-center mb-8">
              <Text
                className="text-sm text-[#6B7280] mr-1"
                style={{
                  lineHeight: 20,
                  ...(Platform.OS === 'android' && { includeFontPadding: false }),
                }}
              >
                Didn't receive?
              </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text
                  className="text-sm text-[#055c3a]"
                  style={{
                    lineHeight: 20,
                    ...(Platform.OS === 'android' && { includeFontPadding: false }),
                  }}
                >
                  Resend OTP
                </Text>
              </TouchableOpacity>
            </View>

            {/* Spacer */}
            <View className="flex-1" />

            {/* Verify Button */}
            <View className="mb-8">
              <Button
                label="Verify"
                onPress={handleVerifyOtp}
                isLoading={isLoading}
                disabled={!isOtpComplete || isLoading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
