import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
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
    dispatch(clearError());
  }, [dispatch]);

  const handlePhoneChange = (text: string) => {
    const numericText = text.replace(/\D/g, '');
    setPhoneNumber(numericText);

    const isValid = isValidMobile(numericText);
    setIsPhoneValid(isValid);

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
          <View className="flex-1 px-6">
            {/* Logo */}
            <View className="items-center pt-16 pb-12">
              <Image
                source={require('../../../assets/logo/logo.png')}
                className="w-16 h-16"
                resizeMode="contain"
              />
            </View>

            {/* Title */}
            <Text
              className="text-2xl font-bold text-[#1C1C1C] mb-2"
              style={{
                lineHeight: 32,
                ...(Platform.OS === 'android' && { includeFontPadding: false }),
              }}
            >
              Login
            </Text>

            {/* Subtitle */}
            <Text
              className="text-base text-[#6B7280] mb-8"
              style={{
                lineHeight: 24,
                ...(Platform.OS === 'android' && { includeFontPadding: false }),
              }}
            >
              Enter your phone number to continue
            </Text>

            {/* Phone Number Input */}
            <View className="mb-6">
              <Text
                className="text-sm text-[#1C1C1C] mb-2"
                style={{
                  lineHeight: 20,
                  ...(Platform.OS === 'android' && { includeFontPadding: false }),
                }}
              >
                Phone Number
              </Text>

              <View
                className={`flex-row items-center bg-white border rounded-lg ${
                  error ? 'border-[#DC2626]' : 'border-[#D1D5DB]'
                }`}
                style={{ height: 52 }}
              >
                {/* Country Code */}
                <View className="h-full justify-center px-4 border-r border-[#D1D5DB]">
                  <Text
                    className="text-base text-[#1C1C1C]"
                    style={{
                      ...(Platform.OS === 'android' && { includeFontPadding: false }),
                    }}
                  >
                    +91
                  </Text>
                </View>

                {/* Phone Input */}
                <TextInput
                  className="flex-1 text-base text-[#1C1C1C]"
                  placeholder="10 digit mobile number"
                  placeholderTextColor="#9CA3AF"
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  keyboardType="number-pad"
                  maxLength={10}
                  editable={!isLoading}
                  style={{
                    paddingHorizontal: 16,
                    height: 52,
                    fontSize: 16,
                    paddingTop: Platform.OS === 'ios' ? 14 : 0,
                    paddingBottom: Platform.OS === 'ios' ? 14 : 0,
                    ...(Platform.OS === 'android' && {
                      includeFontPadding: false,
                      textAlignVertical: 'center',
                    }),
                  }}
                />
              </View>

              {/* Error Message */}
              {error && (
                <Text
                  className="text-sm text-[#DC2626] mt-2"
                  style={{
                    lineHeight: 20,
                    ...(Platform.OS === 'android' && { includeFontPadding: false }),
                  }}
                >
                  {error}
                </Text>
              )}
            </View>

            {/* Spacer */}
            <View className="flex-1" />

            {/* Send OTP Button */}
            <View className="mb-6">
              <Button
                label="Send OTP"
                onPress={handleLogin}
                isLoading={isLoading}
                disabled={isButtonDisabled}
              />
            </View>

            {/* Terms */}
            <Text
              className="text-xs text-[#9CA3AF] text-center mb-8"
              style={{
                lineHeight: 18,
                ...(Platform.OS === 'android' && { includeFontPadding: false }),
              }}
            >
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

