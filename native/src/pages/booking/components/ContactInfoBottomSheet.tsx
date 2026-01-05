import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ContactInfoData } from '../../../types/booking';
import Button from '../../../components/ui/Button';
import Input from '../../../components/common/Input';

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
  const [isClosing, setIsClosing] = useState(false);

  const [errors, setErrors] = useState<{
    contactPerson?: string;
    phone?: string;
    description?: string;
  }>({});

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      setIsClosing(false); // Reset isClosing when opening
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
    if (initialData) {
      setContactPerson(initialData.contactPerson || '');
      setPhone(initialData.phone || '');
      setDescription(initialData.description || '');
      setSpecialInstructions(initialData.specialInstructions || '');
    }
  }, [initialData]);

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

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    onClose();
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const data: ContactInfoData = {
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      description: description.trim(),
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 4}
      >
        <View className="flex-1">
          {/* Overlay */}
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
            <TouchableOpacity className="flex-1" onPress={handleClose} activeOpacity={1} />
          </Animated.View>

          {/* Bottom Sheet */}
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: '85%',
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
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                  <Text className="text-xl font-semibold text-[#111928]" style={{ fontFamily: 'Inter-SemiBold' }}>
                    Contact Information
                  </Text>
                  <TouchableOpacity onPress={handleClose}>
                    <Text className="text-2xl text-[#6B7280]">×</Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-1">
                  {/* Content */}
                  <ScrollView
                    contentContainerStyle={{ paddingBottom: 20 }}
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
                          required
                          placeholder="Describe your requirements"
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
                  <View className="px-6 pb-8 bg-white border-t border-[#E5E7EB]" style={{ paddingTop: 12 }}>
                    <Button label="Save" onPress={handleSave} />
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
