import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { requestOTP, clearError } from '../../store/slices/authSlice';
import Button from '../../components/ui/Button';
import { isValidMobile } from '../../utils/validation';

interface LoginScreenProps {
  onOTPSent?: (phoneNumber: string) => void;
}

export default function LoginScreen({ onOTPSent }: LoginScreenProps) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  useEffect(() => {
    // Clear error when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const handlePhoneChange = (text: string) => {
    // Only allow numeric input
    const numericText = text.replace(/\D/g, '');
    setPhoneNumber(numericText);
    
    // Validate phone number
    const isValid = isValidMobile(numericText);
    setIsPhoneValid(isValid);
    
    // Clear error when user starts typing
    if (numericText.length > 0) {
      dispatch(clearError());
    }
  };

  const handleLogin = async () => {
    if (!isPhoneValid) {
      return;
    }

    try {
      const phoneNumberWithCode = `+91${phoneNumber}`;
      const result = await dispatch(requestOTP(phoneNumberWithCode));

      if (requestOTP.fulfilled.match(result)) {
        // OTP sent successfully, navigate to OTP screen
        if (onOTPSent) {
          onOTPSent(phoneNumberWithCode);
        }
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
    }
  };

  const isButtonDisabled = !isPhoneValid || isLoading;

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-16">
            {/* Title */}
            <Text
              className="text-2xl font-bold text-[#111928] mb-1"
              style={{
                fontFamily: 'Inter-Bold',
                lineHeight: 32,
                ...(Platform.OS === 'android' && { includeFontPadding: false }),
              }}
            >
              Enter your phone number
            </Text>

            {/* Subtitle */}
            <Text
              className="text-sm text-[#4B5563] mb-6"
              style={{
                fontFamily: 'Inter-Regular',
                lineHeight: 20,
                ...(Platform.OS === 'android' && { includeFontPadding: false }),
              }}
            >
              we will send you a text with a verification code.
            </Text>

            {/* Phone Number Label */}
            <Text
              className="text-sm font-medium text-[#111928] mb-2"
              style={{
                fontFamily: 'Inter-Medium',
                lineHeight: 18,
                ...(Platform.OS === 'android' && { includeFontPadding: false }),
              }}
            >
              Phone Number
            </Text>

            {/* Phone Number Input */}
            <View className="flex-row items-stretch mb-2">
              {/* Country Code Box */}
              <View
                className="px-4 border border-[#E5E7EB] rounded-lg justify-center items-center"
                style={{ minHeight: 48 }}
              >
                <Text
                  className="text-sm font-medium text-[#111928]"
                  style={{
                    fontFamily: 'Inter-Medium',
                    lineHeight: 20,
                    ...(Platform.OS === 'android' && { includeFontPadding: false }),
                  }}
                >
                  +91
                </Text>
              </View>

              <View className="flex-1 ml-2">
                <View
                  className={`border rounded-lg ${
                    error ? 'border-[#B3261E]' : 'border-[#E5E7EB]'
                  }`}
                  style={{
                    minHeight: 48,
                    justifyContent: 'center',
                  }}
                >
                  <TextInput
                    className="text-base text-[#111928]"
                    placeholder="Enter your phone number"
                    placeholderTextColor="#9CA3AF"
                    value={phoneNumber}
                    onChangeText={handlePhoneChange}
                    keyboardType="number-pad"
                    maxLength={10}
                    editable={!isLoading}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: Platform.OS === 'ios' ? 14 : 12,
                      margin: 0,
                      fontSize: 16,
                      lineHeight: Platform.OS === 'ios' ? 20 : 22,
                      textAlignVertical: 'center',
                      fontFamily: 'Inter-Regular',
                      ...(Platform.OS === 'android' && {
                        includeFontPadding: false,
                        textAlignVertical: 'center',
                      }),
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <Text
                className="text-sm text-[#B3261E] mb-4"
                style={{
                  fontFamily: 'Inter-Regular',
                  lineHeight: 18,
                  ...(Platform.OS === 'android' && { includeFontPadding: false }),
                }}
              >
                {error}
              </Text>
            )}

            {/* Spacer */}
            <View className="flex-1" />

            {/* Terms and Conditions */}
            <Text
              className="text-xs text-[#6B7280] text-center px-4 mb-2"
              style={{
                fontFamily: 'Inter-Regular',
                lineHeight: 16,
                ...(Platform.OS === 'android' && { includeFontPadding: false }),
              }}
            >
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>

            {/* Send OTP Button */}
            <View className="mb-6">
              <Button
                label="Send OTP"
                onPress={handleLogin}
                isLoading={isLoading}
                disabled={isButtonDisabled}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

