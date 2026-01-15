import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../store/hooks';
import { getBrokerProfile, updateBrokerProfile } from '../../store/slices/authSlice';
import type { Address, CreateAddressRequest } from '../../services';
import Button from '../../components/ui/Button';
import Input from '../../components/common/Input';
import BackIcon from '../../components/icons/BackIcon';
import AddressIcon from '../../components/icons/AddressIcon';
import AddEditAddressBottomSheet from './components/AddEditAddressBottomSheet';
import EditIcon from '../../components/icons/EditIcon';

interface EditBrokerProfileScreenProps {
  onBack: () => void;
}

type Step = 'contact' | 'address' | 'license' | 'review';

interface FormData {
  contactInfo: {
    alternative_number: string;
  };
  address: Address | null;
  license: string;
  agency: string;
}

export default function EditBrokerProfileScreen({ onBack }: EditBrokerProfileScreenProps) {
  const dispatch = useAppDispatch();
  const [currentStep, setCurrentStep] = useState<Step>('contact');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    contactInfo: {
      alternative_number: '',
    },
    address: null,
    license: '',
    agency: '',
  });

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps: { id: Step; title: string }[] = [
    { id: 'contact', title: 'Contact Information' },
    { id: 'address', title: 'Address' },
    { id: 'license', title: 'License & Agency' },
    { id: 'review', title: 'Review & Update' },
  ];

  useEffect(() => {
    loadBrokerProfile();
  }, []);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const loadBrokerProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await dispatch(getBrokerProfile()).unwrap();

      if (profile) {
        // Parse JSON strings from backend
        let parsedAddress = null;
        let parsedContactInfo = null;

        try {
          if (typeof profile.address === 'string') {
            parsedAddress = JSON.parse(profile.address);
          } else {
            parsedAddress = profile.address;
          }
        } catch (e) {
          // Error parsing address
        }

        try {
          if (typeof profile.contact_info === 'string') {
            parsedContactInfo = JSON.parse(profile.contact_info);
          } else {
            parsedContactInfo = profile.contact_info;
          }
        } catch (e) {
          // Error parsing contact_info
        }

        const newFormData = {
          contactInfo: {
            alternative_number: parsedContactInfo?.alternative_number || '',
          },
          address: parsedAddress
            ? {
                id: 0,
                name: 'Work',
                address: parsedAddress.street || '',
                city: parsedAddress.city || '',
                state: parsedAddress.state || '',
                country: 'India',
                postal_code: parsedAddress.pincode || '',
                postalCode: parsedAddress.pincode || '',
                latitude: 0,
                longitude: 0,
                house_number: '',
                houseNumber: '',
                landmark: parsedAddress.landmark || '',
                is_default: false,
                isDefault: false,
              }
            : null,
          license: profile.license || '',
          agency: profile.agency || '',
        };

        setFormData(newFormData);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load broker profile');
      onBack();
    } finally {
      setIsLoading(false);
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 'contact':
        if (
          formData.contactInfo.alternative_number &&
          formData.contactInfo.alternative_number.length < 10
        ) {
          newErrors.alternative_number = 'Alternative number must be at least 10 digits';
        }
        break;

      case 'address':
        if (!formData.address) {
          newErrors.address = 'Address is required';
        }
        break;

      case 'license':
        if (!formData.license) {
          newErrors.license = 'License number is required';
        }
        if (!formData.agency) {
          newErrors.agency = 'Agency name is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (!formData.address) {
      Alert.alert('Error', 'Address is required');
      return;
    }

    try {
      setIsSubmitting(true);

      const updateData = {
        contact_info: {
          alternative_number: formData.contactInfo.alternative_number,
        },
        address: {
          street: formData.address.address,
          city: formData.address.city,
          state: formData.address.state,
          pincode: formData.address.postal_code || formData.address.postalCode || '',
          landmark: formData.address.landmark || '',
        },
        license: formData.license,
        agency: formData.agency,
      };

      await dispatch(updateBrokerProfile(updateData)).unwrap();

      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => onBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressSave = async (address: CreateAddressRequest) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        id: 0,
        name: address.name || '',
        address: address.address,
        city: address.city,
        state: address.state,
        country: address.country || 'India',
        postal_code: address.postal_code,
        postalCode: address.postal_code,
        latitude: address.latitude || 0,
        longitude: address.longitude || 0,
        house_number: address.house_number || '',
        houseNumber: address.house_number || '',
        landmark: address.landmark || '',
        is_default: address.is_default || false,
        isDefault: address.is_default || false,
      },
    }));
    setShowAddressSheet(false);
    setErrors((prev) => ({ ...prev, address: '' }));
  };

  const renderStepIndicator = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);

    return (
      <View className="border-b border-[#E5E7EB] bg-white px-6 py-4">
        {/* Progress bar */}
        <View className="mb-4 flex-row" style={{ gap: 4 }}>
          {steps.map((_, index) => {
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;

            return (
              <View
                key={index}
                className="flex-1"
                style={{
                  height: 4,
                  backgroundColor: isCompleted ? '#055c3a' : isActive ? '#055c3a' : '#E5E7EB',
                  borderRadius: 2,
                }}
              />
            );
          })}
        </View>

        {/* Step info */}
        <View>
          <Text className="mb-1 text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Step {currentIndex + 1} of {steps.length}
          </Text>
          <Text
            className="font-semibold text-lg text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}>
            {steps[currentIndex].title}
          </Text>
        </View>
      </View>
    );
  };

  const renderContactInfo = () => (
    <View className="px-6 pt-6">
      <Text
        className="mb-2 font-semibold text-2xl text-[#111928]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        Contact Information
      </Text>
      <Text className="mb-6 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
        Update your contact details
      </Text>

      <View className="mb-4">
        <Input
          label="Alternative Phone Number"
          value={formData.contactInfo.alternative_number}
          onChangeText={(text) =>
            setFormData((prev) => ({
              ...prev,
              contactInfo: { alternative_number: text },
            }))
          }
          placeholder="Enter alternative phone number"
          keyboardType="phone-pad"
          maxLength={10}
          error={errors.alternative_number}
        />
        <Text className="mt-1 text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
          Optional - Provide an alternative contact number
        </Text>
      </View>
    </View>
  );

  const renderAddress = () => (
    <View className="px-6 pt-6">
      <Text
        className="mb-2 font-semibold text-2xl text-[#111928]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        Address Information
      </Text>
      <Text className="mb-6 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
        Update your office/business address
      </Text>

      {formData.address ? (
        <View className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
          <View className="mb-3 flex-row items-start justify-between">
            <View className="flex-1">
              <Text
                className="font-semibold text-sm text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                {formData.address.address}
              </Text>
              <Text className="mt-1 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                {formData.address.city}, {formData.address.state} -{' '}
                {formData.address.postal_code || formData.address.postalCode}
              </Text>
              {formData.address.landmark && (
                <Text
                  className="mt-1 text-xs text-[#6B7280]"
                  style={{ fontFamily: 'Inter-Regular' }}>
                  Landmark: {formData.address.landmark}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setShowAddressSheet(true)}
              className="p-2"
              activeOpacity={0.7}>
              <EditIcon size={20} color="#055c3a" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setShowAddressSheet(true)}
          className="mb-4 items-center justify-center rounded-xl border-2 border-dashed border-[#E5E7EB] bg-white p-6"
          activeOpacity={0.7}>
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6]">
            <AddressIcon size={24} color="#6B7280" />
          </View>
          <Text
            className="mb-1 font-medium text-sm text-[#111928]"
            style={{ fontFamily: 'Inter-Medium' }}>
            Add Address
          </Text>
          <Text
            className="text-center text-xs text-[#6B7280]"
            style={{ fontFamily: 'Inter-Regular' }}>
            Tap to add your office/business address
          </Text>
        </TouchableOpacity>
      )}

      {errors.address && (
        <Text className="mt-2 text-sm text-[#DC2626]" style={{ fontFamily: 'Inter-Regular' }}>
          {errors.address}
        </Text>
      )}
    </View>
  );

  const renderLicense = () => (
    <View className="px-6 pt-6">
      <Text
        className="mb-2 font-semibold text-2xl text-[#111928]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        License & Agency
      </Text>
      <Text className="mb-6 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
        Update your professional details
      </Text>

      <View className="mb-4">
        <Input
          label="License Number"
          value={formData.license}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, license: text }))}
          placeholder="Enter license number"
          error={errors.license}
          required
        />
      </View>

      <View className="mb-4">
        <Input
          label="Agency Name"
          value={formData.agency}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, agency: text }))}
          placeholder="Enter agency name"
          error={errors.agency}
          required
        />
      </View>
    </View>
  );

  const renderReview = () => (
    <View className="px-6 pt-6">
      <Text
        className="mb-2 font-semibold text-2xl text-[#111928]"
        style={{ fontFamily: 'Inter-SemiBold' }}>
        Review Your Changes
      </Text>
      <Text className="mb-6 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
        Please review your information before updating
      </Text>

      {/* Contact Info */}
      <View className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <Text
          className="mb-3 font-semibold text-sm text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Contact Information
        </Text>
        <View className="mb-2">
          <Text className="text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Alternative Number
          </Text>
          <Text className="text-sm text-[#111928]" style={{ fontFamily: 'Inter-Medium' }}>
            {formData.contactInfo.alternative_number || 'Not provided'}
          </Text>
        </View>
      </View>

      {/* Address */}
      <View className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <Text
          className="mb-3 font-semibold text-sm text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Address
        </Text>
        {formData.address && (
          <>
            <Text className="text-sm text-[#111928]" style={{ fontFamily: 'Inter-Regular' }}>
              {formData.address.address}
            </Text>
            <Text className="text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
              {formData.address.city}, {formData.address.state} -{' '}
              {formData.address.postal_code || formData.address.postalCode}
            </Text>
          </>
        )}
      </View>

      {/* License & Agency */}
      <View className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <Text
          className="mb-3 font-semibold text-sm text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          License & Agency
        </Text>
        <View className="mb-2">
          <Text className="text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            License Number
          </Text>
          <Text className="text-sm text-[#111928]" style={{ fontFamily: 'Inter-Medium' }}>
            {formData.license}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Agency Name
          </Text>
          <Text className="text-sm text-[#111928]" style={{ fontFamily: 'Inter-Medium' }}>
            {formData.agency}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'contact':
        return renderContactInfo();
      case 'address':
        return renderAddress();
      case 'license':
        return renderLicense();
      case 'review':
        return renderReview();
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#055c3a" />
          <Text className="mt-4 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        {/* Header */}
        <View className="flex-row items-center border-b border-[#E5E7EB] px-6 py-4">
          <TouchableOpacity onPress={onBack} className="-ml-2 p-2" activeOpacity={0.7}>
            <BackIcon size={24} color="#111928" />
          </TouchableOpacity>
          <Text
            className="ml-2 font-semibold text-xl text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}>
            Edit Broker Profile
          </Text>
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <ScrollView
          className="flex-1 bg-[#F9FAFB]"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View
          className={`border-t border-[#E5E7EB] bg-white px-6 pt-4 ${
            isKeyboardVisible ? 'pb-4' : 'pb-12'
          }`}>
          <View className="flex-row" style={{ gap: 12 }}>
            {currentStep !== 'contact' && (
              <View className="flex-1">
                <Button
                  label="Previous"
                  onPress={handlePrevious}
                  variant="outline"
                  disabled={isSubmitting}
                />
              </View>
            )}
            <View className="flex-1">
              {currentStep === 'review' ? (
                <Button
                  label={isSubmitting ? 'Updating...' : 'Update Profile'}
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                />
              ) : (
                <Button label="Next" onPress={handleNext} disabled={isSubmitting} />
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Address Bottom Sheet */}
      {showAddressSheet && (
        <AddEditAddressBottomSheet
          address={formData.address}
          onSave={handleAddressSave}
          onClose={() => setShowAddressSheet(false)}
          visible={showAddressSheet}
          requireLabel={false}
          showOptionalFields={false}
        />
      )}
    </SafeAreaView>
  );
}
