import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OtpBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  phoneNumber: string;
  onSubmit: (otp: string) => void;
  isDeleting?: boolean;
}

export default function OtpBottomSheet({
  visible,
  onClose,
  phoneNumber,
  onSubmit,
  isDeleting = false,
}: OtpBottomSheetProps) {
  const [otp, setOtp] = useState('');
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      setOtp('');
      setOtpInputs(['', '', '', '', '', '']);
      setErrorMessage(null);
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
      // Auto-focus first input when sheet opens
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 400);
    }
  }, [visible]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    onClose();
  };

  const handleOtpChange = (text: string, index: number) => {
    const numericText = text.replace(/\D/g, '');
    
    if (numericText.length > 1) {
      // Handle paste
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
      setErrorMessage(null);
      
      const nextEmptyIndex = newInputs.findIndex((val, idx) => idx >= index && val === '');
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(index + pastedOtp.length - 1, 5);
      if (focusIndex < 6 && focusIndex >= 0) {
        setTimeout(() => {
          inputRefs.current[focusIndex]?.focus();
        }, 50);
      }
    } else {
      const newInputs = [...otpInputs];
      newInputs[index] = numericText;
      setOtpInputs(newInputs);
      const newOtp = newInputs.join('');
      setOtp(newOtp);
      setErrorMessage(null);

      if (numericText && index < 5) {
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 50);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otpInputs[index]) {
        const newInputs = [...otpInputs];
        newInputs[index] = '';
        setOtpInputs(newInputs);
        setOtp(newInputs.join(''));
      } else if (index > 0) {
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

  const handleSubmit = () => {
    if (otp.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit OTP');
      return;
    }
    onSubmit(otp);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace('+', '');
    if (cleanPhone.startsWith('91') && cleanPhone.length >= 12) {
      const mainNumber = cleanPhone.substring(2);
      return `+91 ${mainNumber.substring(0, 5)} ${mainNumber.substring(5)}`;
    }
    return phone;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View className="flex-1">
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
            <SafeAreaView edges={['bottom']} className="flex-1">
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
              >
                <View className="flex-1">
                  <View className="px-6 pt-6">
                    {/* Handle bar */}
                    <View className="items-center mb-6">
                      <View className="w-10 h-1 bg-[#D1D5DB] rounded-full" />
                    </View>

                    {/* Header */}
                    <Text
                      className="text-2xl font-semibold text-[#111928] mb-2"
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      Verify OTP
                    </Text>
                    <Text
                      className="text-sm text-[#6B7280] mb-8"
                      style={{ fontFamily: 'Inter-Regular', lineHeight: 20 }}
                    >
                      Enter the 6-digit OTP sent to {formatPhoneNumber(phoneNumber)} to confirm account deletion.
                    </Text>

                    {/* OTP Inputs */}
                    <View className="flex-row justify-between mb-4" style={{ gap: 8 }}>
                      {otpInputs.map((value, index) => (
                        <View
                          key={index}
                          className="flex-1 border border-[#E5E7EB] rounded-lg"
                          style={{
                            height: 56,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <TextInput
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            value={value}
                            onChangeText={(text) => handleOtpChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            editable={!isDeleting}
                            selectTextOnFocus
                            style={{
                              width: '100%',
                              height: '100%',
                              textAlign: 'center',
                              fontSize: 18,
                              lineHeight: Platform.OS === 'ios' ? 24 : 26,
                              fontFamily: 'Inter-SemiBold',
                              color: '#111928',
                              textAlignVertical: 'center',
                              ...(Platform.OS === 'android' && {
                                includeFontPadding: false,
                                textAlignVertical: 'center',
                              }),
                            }}
                          />
                        </View>
                      ))}
                    </View>

                    {/* Error Message */}
                    {errorMessage && (
                      <Text
                        className="text-sm text-[#DC2626] mb-4"
                        style={{ fontFamily: 'Inter-Regular' }}
                      >
                        {errorMessage}
                      </Text>
                    )}
                  </View>

                  {/* Buttons - Fixed at bottom */}
                  <View className="px-6 pb-12 bg-white border-t border-[#E5E7EB]" style={{ paddingTop: 12 }}>
                    <View className="flex-row" style={{ gap: 12 }}>
                      <TouchableOpacity
                        onPress={handleClose}
                        disabled={isDeleting}
                        className="flex-1 border border-[#D1D5DB] rounded-xl py-4 items-center"
                        activeOpacity={0.7}
                      >
                        <Text
                          className="text-base font-medium text-[#374151]"
                          style={{ fontFamily: 'Inter-Medium' }}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isDeleting || otp.length !== 6}
                        className="flex-1 bg-[#DC2626] rounded-xl py-4 items-center"
                        activeOpacity={0.7}
                        style={{
                          opacity: isDeleting || otp.length !== 6 ? 0.5 : 1,
                        }}
                      >
                        {isDeleting ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text
                            className="text-base font-semibold text-white"
                            style={{ fontFamily: 'Inter-SemiBold' }}
                          >
                            Delete Account
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

