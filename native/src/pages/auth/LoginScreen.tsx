import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
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
      // Error handling
    }
  };

  const isButtonDisabled = !isPhoneValid || isLoading;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-6">
            {/* Logo */}
            <View className="items-center pb-12 pt-16">
              <Image
                source={require('../../../assets/logo/main_logo_with_name.png')}
                className="h-16 w-64"
                resizeMode="contain"
              />
            </View>

            {/* Title */}
            <Text
              className="mb-2 font-bold text-2xl text-[#1C1C1C]"
              style={{
                lineHeight: 32,
                ...(Platform.OS === 'android' && { includeFontPadding: false }),
              }}>
              Login
            </Text>

            {/* Subtitle */}
            <Text
              className="mb-8 text-base text-[#6B7280]"
              style={{
                lineHeight: 24,
                ...(Platform.OS === 'android' && { includeFontPadding: false }),
              }}>
              Enter your phone number to continue
            </Text>

            {/* Phone Number Input */}
            <View className="mb-6">
              <Text
                className="mb-2 text-sm text-[#1C1C1C]"
                style={{
                  lineHeight: 20,
                  ...(Platform.OS === 'android' && { includeFontPadding: false }),
                }}>
                Phone Number
              </Text>

              <View
                className={`flex-row items-center rounded-lg border bg-white ${
                  error ? 'border-[#DC2626]' : 'border-[#D1D5DB]'
                }`}
                style={{ height: 52 }}>
                {/* Country Code */}
                <View className="h-full justify-center border-r border-[#D1D5DB] px-4">
                  <Text
                    className="text-base text-[#1C1C1C]"
                    style={{
                      ...(Platform.OS === 'android' && { includeFontPadding: false }),
                    }}>
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
                  className="mt-2 text-sm text-[#DC2626]"
                  style={{
                    lineHeight: 20,
                    ...(Platform.OS === 'android' && { includeFontPadding: false }),
                  }}>
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
              className="mb-8 text-center text-xs text-[#9CA3AF]"
              style={{
                lineHeight: 18,
                ...(Platform.OS === 'android' && { includeFontPadding: false }),
              }}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
