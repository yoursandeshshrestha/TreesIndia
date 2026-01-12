import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Platform,
  Modal,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Dimensions,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ContactInfoData } from '../../../types/booking';
import Button from '../../../components/ui/Button';
import Input from '../../../components/common/Input';
import CancelIcon from '../../../components/icons/CancelIcon';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ContactInfoBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: ContactInfoData) => void;
  initialData?: ContactInfoData;
}

export default function ContactInfoBottomSheet({
  visible,
  onClose,
  onSave,
  initialData,
}: ContactInfoBottomSheetProps) {
  const [contactPerson, setContactPerson] = useState(initialData?.contactPerson || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [specialInstructions, setSpecialInstructions] = useState(initialData?.specialInstructions || '');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [errors, setErrors] = useState<{
    contactPerson?: string;
    phone?: string;
    description?: string;
  }>({});

  useEffect(() => {
    if (initialData) {
      setContactPerson(initialData.contactPerson || '');
      setPhone(initialData.phone || '');
      setDescription(initialData.description || '');
      setSpecialInstructions(initialData.specialInstructions || '');
    }
  }, [initialData]);

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

  const validateForm = (): boolean => {
    const newErrors: {
      contactPerson?: string;
      phone?: string;
      description?: string;
    } = {};

    if (!contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person name is required';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleanPhone = phone.replace(/\D/g, '');
      // Accept 10 digits (direct number) or 12 digits starting with 91 (Indian country code)
      if (cleanPhone.length === 10) {
        // Valid: 10-digit phone number
      } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
        // Valid: country code + 10-digit phone number
      } else {
        newErrors.phone = 'Please enter a valid phone number (10 digits or +91 followed by 10 digits)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const data: ContactInfoData = {
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      description: description.trim() || undefined,
      specialInstructions: specialInstructions.trim() || undefined,
    };

    onSave(data);
    handleClose();
  };

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const maxSheetHeight = keyboardHeight > 0
    ? SCREEN_HEIGHT - keyboardHeight - 150
    : SCREEN_HEIGHT * 0.75;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleClose}
          className="flex-1 bg-black/50 justify-end"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{ maxHeight: maxSheetHeight }}
            className="bg-white rounded-t-3xl"
          >
            {/* Floating Close Button */}
            <View
              style={{
                position: 'absolute',
                top: -56,
                right: 16,
                zIndex: 30,
              }}
            >
              <TouchableOpacity
                onPress={handleClose}
                className="w-12 h-12 bg-white rounded-full items-center justify-center"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <CancelIcon size={24} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <Text className="text-xl font-semibold text-[#111928]" style={{ fontFamily: 'Inter-SemiBold' }}>
                Contact Information
              </Text>
            </View>

            {/* Content */}
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="px-6 pt-4">
                <View className="mb-4">
                  <Input
                    label="Contact Person"
                    required
                    placeholder="Enter full name"
                    value={contactPerson}
                    onChangeText={(text) => {
                      setContactPerson(text);
                      clearError('contactPerson');
                    }}
                    error={errors.contactPerson}
                  />
                </View>

                <View className="mb-4">
                  <Input
                    label="Phone Number"
                    required
                    placeholder="Enter phone number (10 digits or +91...)"
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text);
                      clearError('phone');
                    }}
                    keyboardType="phone-pad"
                    maxLength={15}
                    error={errors.phone}
                  />
                </View>

                <View className="mb-4">
                  <Input
                    label="Description"
                    placeholder="Describe your requirements (optional)"
                    value={description}
                    onChangeText={(text) => {
                      setDescription(text);
                      clearError('description');
                    }}
                    multiline
                    numberOfLines={4}
                    error={errors.description}
                  />
                </View>

                <View className="mb-4">
                  <Input
                    label="Special Instructions"
                    placeholder="Any additional notes (optional)"
                    value={specialInstructions}
                    onChangeText={setSpecialInstructions}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Footer - Fixed at bottom */}
            <SafeAreaView edges={['bottom']} className="bg-white border-t border-[#E5E7EB]">
              <View className={`px-6 pt-4 ${keyboardHeight > 0 ? 'pb-4' : 'pb-16'}`}>
                <Button label="Save" onPress={handleSave} />
              </View>
            </SafeAreaView>
            </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
